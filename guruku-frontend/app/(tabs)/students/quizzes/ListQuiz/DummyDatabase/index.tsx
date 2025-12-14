export interface QuizData {
  exam_id: string;
  invite_code: string;
  subject_name: string;
  exam_title: string;
  total_questions_to_display: number;
  duration_minutes: number;
  deadline: string;
  rules: string;
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  answer: string;
}

export const AVAILABLE_QUIZZES: QuizData[] = [
  {
    exam_id: "CODE_PY1",
    invite_code: "CAE9EC7A", 
    subject_name: "Code Class - Dasar",
    exam_title: "Python Basic: Variabel",
    total_questions_to_display: 5,
    duration_minutes: 20,
    deadline: "12 Desember 2025",
    rules: "Kerjakan soal dasar Python."
  },
  {
    exam_id: "CODE_LOGIC",
    invite_code: "CAE9EC7A", 
    subject_name: "Code Class - Dasar",
    exam_title: "Logika Algoritma",
    total_questions_to_display: 5,
    duration_minutes: 30,
    deadline: "15 Desember 2025",
    rules: "Materi logika dasar."
  },
  {
    exam_id: "CODE_WEB",
    invite_code: "E4E35E42", 
    subject_name: "Code Class - Web",
    exam_title: "Dasar HTML & CSS",
    total_questions_to_display: 5,
    duration_minutes: 25,
    deadline: "20 Desember 2025",
    rules: "Struktur web dasar."
  }
];

export const QUESTIONS_BANK: Record<string, Question[]> = {
  "CODE_PY1": [
    { id: 1, question: "Output print(10+5)?", options: ["15", "105", "Error", "10"], answer: "15" },
    { id: 2, question: "Tipe data teks?", options: ["str", "int", "bool", "float"], answer: "str" },
    { id: 3, question: "Komentar di Python?", options: ["#", "//", "/*", "--"], answer: "#" },
    { id: 4, question: "x=5. Tipe x?", options: ["int", "str", "char", "float"], answer: "int" },
    { id: 5, question: "Input data user?", options: ["input()", "get()", "scan()", "read()"], answer: "input()" }
  ],
  "CODE_LOGIC": [
    { id: 1, question: "True AND False?", options: ["False", "True", "Error", "Null"], answer: "False" },
    { id: 2, question: "Simbol sama dengan?", options: ["==", "=", "===", ":="], answer: "==" },
    { id: 3, question: "Loop kondisi?", options: ["While", "For", "Do", "Repeat"], answer: "While" },
    { id: 4, question: "Index awal array?", options: ["0", "1", "-1", "A"], answer: "0" },
    { id: 5, question: "Logika ATAU?", options: ["OR", "AND", "NOT", "XOR"], answer: "OR" }
  ],
  "CODE_WEB": [
    { id: 1, question: "Tag paragraf?", options: ["<p>", "<div>", "<span>", "<h1>"], answer: "<p>" }
  ]
};