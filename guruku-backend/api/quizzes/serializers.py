from rest_framework import serializers
from django.db import transaction
from .models import Quiz, Question, Choice, QuizAttempt, UserAnswer
from api.classes.models import Class

class ChoiceAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['id', 'text', 'is_correct']

class QuestionAdminSerializer(serializers.ModelSerializer):
    choices = ChoiceAdminSerializer(many=True)

    class Meta:
        model = Question
        fields = ['id', 'text', 'order', 'points', 'choices']

class QuizAdminSerializer(serializers.ModelSerializer):
    questions = QuestionAdminSerializer(many=True)
    class_id = serializers.PrimaryKeyRelatedField(queryset=Class.objects.all(), source='class_obj', write_only=True)
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
                choices_data = q_data.pop('choices')
                question = Question.objects.create(quiz=quiz, **q_data)
                for c_data in choices_data:
                    Choice.objects.create(question=question, **c_data)

            quiz.total_questions = quiz.questions.count()
            quiz.save()
            
        return quiz

    def update(self, instance, validated_data):
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.duration_minutes = validated_data.get('duration_minutes', instance.duration_minutes)
        instance.deadline = validated_data.get('deadline', instance.deadline)
        instance.is_active = validated_data.get('is_active', instance.is_active)
        instance.class_obj = validated_data.get('class_obj', instance.class_obj)
        instance.save()
        if 'questions' in validated_data:
            questions_data = validated_data.pop('questions')
            with transaction.atomic():
                instance.questions.all().delete()
                
                for q_data in questions_data:
                    choices_data = q_data.pop('choices')
                    question = Question.objects.create(quiz=instance, **q_data)
                    
                    for c_data in choices_data:
                        Choice.objects.create(question=question, **c_data)
                
                instance.total_questions = instance.questions.count()
                instance.save()
                
        return instance

class ChoiceStudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['id', 'text'] 

class QuestionStudentSerializer(serializers.ModelSerializer):
    choices = ChoiceStudentSerializer(many=True, read_only=True)
    class Meta:
        model = Question
        fields = ['id', 'text', 'order', 'points', 'choices']

class QuizDetailSerializer(serializers.ModelSerializer):
    questions = QuestionStudentSerializer(many=True, read_only=True)
    class_name = serializers.CharField(source='class_obj.name', read_only=True)
    
    class Meta:
        model = Quiz
        fields = [
            'id', 'title', 'description', 
            'class_name', 'duration_minutes', 
            'deadline', 'questions'
        ]

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
                c_id = item.get('choice_id')
                try:
                    question_obj = Question.objects.get(id=q_id, quiz=quiz)
                    choice_obj = Choice.objects.get(id=c_id, question=question_obj)
                    
                    UserAnswer.objects.create(
                        attempt=attempt,
                        question=question_obj,
                        selected_choice=choice_obj
                    )
                
                    if choice_obj.is_correct:
                        total_score += question_obj.points
                        
                except (Question.DoesNotExist, Choice.DoesNotExist):
                    continue 

            attempt.score = total_score
            attempt.save()
            
        return attempt