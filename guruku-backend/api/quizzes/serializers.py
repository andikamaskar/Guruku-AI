from rest_framework import serializers
from django.db import transaction
from .models import Quiz, Question, QuizAttempt, UserAnswer
from api.classes.models import Class

class QuestionAdminSerializer(serializers.ModelSerializer):
    options = serializers.ListField(
        child=serializers.CharField(), 
        min_length=2, 
        help_text="Masukkan minimal 2 pilihan"
    )

    class Meta:
        model = Question
        fields = ['id', 'text', 'order', 'points', 'options', 'answer']

    def validate(self, data):
        """Validasi: Kunci jawaban harus ada di dalam daftar options"""
        options = data.get('options', [])
        answer = data.get('answer', '')
        
        if answer not in options:
            raise serializers.ValidationError(
                f"Jawaban '{answer}' tidak ditemukan di dalam pilihan options yang tersedia."
            )
        return data

class QuizAdminSerializer(serializers.ModelSerializer):
    questions = QuestionAdminSerializer(many=True)
    class_id = serializers.PrimaryKeyRelatedField(
        queryset=Class.objects.all(), source='class_obj', write_only=True
    )
    class_name = serializers.CharField(source='class_obj.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Quiz
        fields = [
            'id', 'exam_id', 'title', 'description', 
            'class_id', 'class_name', 
            'duration_minutes', 'deadline', 'is_active', 
            'total_questions', 'max_score', 
            'questions', 
            'created_by', 'created_by_name', 'created_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'total_questions']

    def create(self, validated_data):
        questions_data = validated_data.pop('questions')
        user = self.context['request'].user
        
        with transaction.atomic():
            quiz = Quiz.objects.create(created_by=user, **validated_data)
            for q_data in questions_data:
                Question.objects.create(quiz=quiz, **q_data)
            
            quiz.total_questions = quiz.questions.count()
            quiz.save()
            
        return quiz

    def update(self, instance, validated_data):
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.duration_minutes = validated_data.get('duration_minutes', instance.duration_minutes)
        instance.deadline = validated_data.get('deadline', instance.deadline)
        instance.is_active = validated_data.get('is_active', instance.is_active)
        instance.save()
        
        if 'questions' in validated_data:
            questions_data = validated_data.pop('questions')
            with transaction.atomic():
                instance.questions.all().delete()
                for q_data in questions_data:
                    Question.objects.create(quiz=instance, **q_data)
                
                instance.total_questions = instance.questions.count()
                instance.save()
                
        return instance

class QuestionStudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'text', 'order', 'points', 'options']

class QuizDetailSerializer(serializers.ModelSerializer):
    questions = QuestionStudentSerializer(many=True, read_only=True)
    class_name = serializers.CharField(source='class_obj.name', read_only=True)
    
    class Meta:
        model = Quiz
        fields = ['id', 'title', 'description', 'class_name', 'duration_minutes', 'deadline', 'questions']

class QuizAttemptSerializer(serializers.ModelSerializer):
    answers = serializers.ListField(write_only=True)
    student_name = serializers.CharField(source='user.username', read_only=True)
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)

    class Meta:
        model = QuizAttempt
        fields = ['id', 'quiz', 'quiz_title', 'user', 'student_name', 'score', 'submitted_at', 'answers']
        read_only_fields = ['score', 'submitted_at', 'user', 'quiz']

    def create(self, validated_data):
        answers_data = validated_data.pop('answers')
        user = self.context['request'].user
        quiz = validated_data.get('quiz')
        
        total_score = 0
        
        with transaction.atomic():
            attempt = QuizAttempt.objects.create(user=user, quiz=quiz, score=0)
            
            for item in answers_data:
                q_id = item.get('question_id')
                user_ans_text = item.get('answer_text')
                
                try:
                    question_obj = Question.objects.get(id=q_id, quiz=quiz)

                    UserAnswer.objects.create(
                        attempt=attempt,
                        question=question_obj,
                        answer_text=user_ans_text
                    )
                    if str(user_ans_text).strip() == str(question_obj.answer).strip():
                        total_score += question_obj.points
                        
                except Question.DoesNotExist:
                    continue

            attempt.score = total_score
            attempt.save()
            
        return attempt