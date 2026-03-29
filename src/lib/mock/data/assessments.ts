import type { Assessment } from "@/types";

export const mockAssessments: Assessment[] = [
  {
    id: "assess-1",
    patientId: "user-1",
    patientName: "Ahmed Rahman",
    formData: {
      step1: {
        prayerFrequency: "5_times",
        quranFrequency: "weekly",
        spiritualPractices: ["Regular Dhikr", "Daily Dua"],
        confidentialNotes: "",
      },
      step2: {
        physicalSymptoms: ["Frequent headaches", "Chronic fatigue", "Tightness in chest"],
        elaboration: "Headaches have been recurring for the past 2 months, especially after Fajr.",
      },
      step3: {
        emotionalSymptoms: ["Persistent anxiety", "Difficulty concentrating"],
        emotionalDetails: "Feeling overwhelmed with work and family responsibilities.",
        previousDiagnosis: "",
      },
      step4: {
        spiritualSymptoms: ["Feeling an unseen presence"],
        unusualBehavior: "",
        familyHistory: "Mother had similar experiences.",
        preferredMode: "offline",
        contactTime: "After 5 PM",
        additionalNotes: "Would prefer a male practitioner.",
      },
    },
    status: "reviewed",
    assignedDoctorId: "doc-2",
    assignedDoctorName: "Dr. Maryam Hassan",
    adminNotes: "Recommend Ruqyah sessions followed by counseling.",
    createdAt: "2025-03-20T10:00:00Z",
    updatedAt: "2025-03-22T14:00:00Z",
  },
  {
    id: "assess-2",
    patientId: "user-2",
    patientName: "Fatima Akter",
    formData: {
      step1: {
        prayerFrequency: "sometimes",
        quranFrequency: "rarely",
        spiritualPractices: ["Daily Dua"],
      },
      step2: {
        physicalSymptoms: ["Sleep disturbances/Insomnia", "Changes in appetite"],
        elaboration: "Cannot sleep well for the past month.",
      },
      step3: {
        emotionalSymptoms: ["Depression/sadness", "Social withdrawal", "Mood swings"],
        emotionalDetails: "Feeling isolated and sad most of the time.",
      },
      step4: {
        spiritualSymptoms: ["Frequent nightmares"],
        preferredMode: "online",
        contactTime: "Anytime",
      },
    },
    status: "pending",
    createdAt: "2025-03-28T08:00:00Z",
    updatedAt: "2025-03-28T08:00:00Z",
  },
];
