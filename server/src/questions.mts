type ImageInfo = {
    src: string,
    alt: string
}

type MultipleChoiceType = {
    type: "mc",
    options: [string, string, string, string],
    matchingKeywords: [string, string, string, string]
}

type ShortAnswerType = {
    type: "short"
}

type SelectType = {
    type: "select",
    options: [string, string, string, string],
    matchingKeywords: [string, string, string, string],
}

type QuestionType = {
    prompt: string,
    info: MultipleChoiceType | ShortAnswerType | SelectType
    image?: ImageInfo;
}

export const questions: QuestionType[] = [
    {
        prompt: "You come home to this, what do you do first?",
        info: {
            type: "mc",
            options: ["Burst into rage 🤬", "Join in 😁", "Calm Discipline 🥺", "Go for a walk 🦮"],
            matchingKeywords: ["low energy", "high energy", "listens", "energetic"]
        },
        image: {
            src: "https://image.petmd.com/files/styles/978x550/public/2023-04/dog-chewing-furniture.jpg",
            alt: "image dog destroys something after being left home home"
        }
    },

    {
        prompt: "Your pet prefers a day at the?",
        info: {
            type: "mc",
            options: ["Beach 🤬", "Park 😁", "Office 🥺", "Couch 🦮"],
            matchingKeywords: ["likes the beach", "likes the park", "likes quiet spaces", "likes to be home"]
        },
    },

    {
        prompt: "Question3",
        info: {
            type: "mc",
            options: ["Burst into rage 🤬", "Join in 😁", "Calm Discipline 🥺", "Go for a walk 🦮"],
            matchingKeywords: ["low energy", "high energy", "listens", "energetic"]
        },
        image: {
            src: "https://image.petmd.com/files/styles/978x550/public/2023-04/dog-chewing-furniture.jpg",
            alt: "image dog destroys something after being left home home"
        }
    },

    {
        prompt: "Question4",
        info: {
          type: "mc",
          options: ["Burst into rage 🤬", "Join in 😁", "Calm Discipline 🥺", "Go for a walk 🦮"],
          matchingKeywords: ["low energy", "high energy", "listens", "energetic"]
        },
        image: {
          src: "https://image.petmd.com/files/styles/978x550/public/2023-04/dog-chewing-furniture.jpg",
          alt: "image dog destroys something after being left home home"
        }
    },


    // short answer
    {
        prompt: "Short Answer Question",
        info: {
          type: "short",
        },
        image: {
          src: "https://image.petmd.com/files/styles/978x550/public/2023-04/dog-chewing-furniture.jpg",
          alt: "image dog destroys something after being left home home"
        }
    },

    // select
    {
        prompt: "Select All That Apply",
        info: {
          type: "select",
          options: ["Burst into rage 🤬", "Join in 😁", "Calm Discipline 🥺", "Go for a walk 🦮"],
          matchingKeywords: ["low energy", "high energy", "listens", "energetic"]
        },
        image: {
          src: "https://image.petmd.com/files/styles/978x550/public/2023-04/dog-chewing-furniture.jpg",
          alt: "image dog destroys something after being left home home"
        }
    },
    
];