import api, { getAuthHeader } from "./api";

// === TYPES ===
export interface Question {
    id?: string;
    text: string;
    order: number;
    points: number;
    options: string[];
    answer: string;
}

export interface Quiz {
    id: string;
    title: string;
    description: string;
    class_id?: string;
    class_name: string;
    duration_minutes: number;
    deadline: string;
    is_active: boolean;
    total_questions: number;
    max_score: number;
    questions?: Question[];
    created_at?: string;
}

export interface QuizAttempt {
    id: string;
    quiz_title: string;
    score: number;
    submitted_at: string;
}

// === API CALLS ===

// 1. Get Quizzes (Teacher)
export const fetchTeacherQuizzes = async () => {
    const token = await getAuthHeader();
    if (!token) throw new Error("No access token found");

    const response = await api.get("/quizzes/manage/", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

// 2. Get Quizzes (Student)
export const fetchStudentQuizzes = async () => {
    const token = await getAuthHeader();
    if (!token) throw new Error("No access token found");

    // This endpoint returns quizzes for classes the student is enrolled in
    const response = await api.get("/quizzes/student/", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

// 3. Create Quiz
export const createQuiz = async (quizData: any) => {
    const token = await getAuthHeader();
    if (!token) throw new Error("No access token found");

    const response = await api.post("/quizzes/manage/", quizData, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

// 4. Get Quiz Details (Student View - with Questions)
export const getQuizDetail = async (id: string) => {
    const token = await getAuthHeader();
    if (!token) throw new Error("No access token found");

    const response = await api.get(`/quizzes/student/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

// 5. Submit Quiz
export const submitQuiz = async (id: string, answers: any) => {
    const token = await getAuthHeader();
    if (!token) throw new Error("No access token found");

    const response = await api.post(
        `/quizzes/student/${id}/submit/`,
        { answers },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

// 6. Get Student History
export const fetchQuizHistory = async () => {
    const token = await getAuthHeader();
    if (!token) throw new Error("No access token found");

    const response = await api.get("/quizzes/student/history/", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

// 7. Get Quiz Detail (Teacher - for Editing)
export const getQuizDetailTeacher = async (id: string) => {
    const token = await getAuthHeader();
    if (!token) throw new Error("No access token found");

    const response = await api.get(`/quizzes/manage/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
}

// 8. Update Quiz
export const updateQuiz = async (id: string, quizData: any) => {
    const token = await getAuthHeader();
    if (!token) throw new Error("No access token found");

    const response = await api.put(`/quizzes/manage/${id}/`, quizData, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

// 9. Delete Quiz
export const deleteQuiz = async (id: string) => {
    const token = await getAuthHeader();
    if (!token) throw new Error("No access token found");

    await api.delete(`/quizzes/manage/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

// 10. Generate Quiz From File (AI)
export const generateQuizFromMaterial = async (fileUri: string, fileType: string, fileName: string, numQuestions: number = 5) => {
    const token = await getAuthHeader();
    if (!token) throw new Error("No access token found");

    const formData = new FormData();
    formData.append('file', {
        uri: fileUri,
        type: fileType,
        name: fileName,
    } as any);
    formData.append('num_questions', numQuestions.toString());

    // Note: Axios with FormData in React Native sometimes needs special headers content-type: multipart/form-data
    // but usually axios handles it if data is FormData.
    const response = await api.post("/quizzes/manage/generate_from_file/", formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};
