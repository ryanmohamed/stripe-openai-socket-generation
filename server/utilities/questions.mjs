export const questions = [
    // Question 1
    {
        prompt: "How does your pet react to loud noises, such as thunderstorms or fireworks?",
        info: {
            type: "mc",
            options: ["Becomes anxious and hides 🙈", "Barks or howls loudly 🐾", "Seems unfazed and calm 😌", "Tries to escape or run away 🏃"],
            matchingKeywords: ["fearful and anxious", "vocal and expressive", "relaxed and composed", "panicky and anxious"]
        },
    },
    // Question 2
    {
        prompt: "What is your pet's preferred sleeping spot?",
        info: {
            type: "mc",
            options: ["On the bed 🛏️", "In a cozy pet bed 🐾", "On the couch 🛋️", "Anywhere they find comfortable 😴"],
            matchingKeywords: ["likes to sleep on the bed", "prefers a dedicated pet bed", "enjoys lounging on the couch", "adapts to any comfortable spot"]
        },
    },
    // Question 3
    {
        prompt: "Does your pet enjoy car rides?",
        info: {
            type: "mc",
            options: ["Loves car rides and gets excited 🚗", "Gets anxious or car sick 🤢", "Tolerates car rides calmly 😐", "Hasn't been in a car before or unsure 🤔"],
            matchingKeywords: ["eager and enthusiastic about car rides", "uneasy and uncomfortable during car rides", "calm and composed during car rides", "lack of experience or uncertain about car rides"]
        },
    },
    // Question 4
    {
        prompt: "How does your pet behave around other animals, such as dogs or cats?",
        info: {
            type: "mc",
            options: ["Gets along well and loves to play 🐾", "Shows aggression or dominance 🦁", "Is indifferent and ignores them 😐", "Gets scared or intimidated 😱"],
            matchingKeywords: ["social and friendly towards other animals", "dominant or aggressive towards other animals", "nonchalant and disinterested in other animals", "fearful or overwhelmed by other animals"]
        },
    },
    // Question 5 (Short Answer)
    {
        prompt: "What is your pet's favorite toy?",
        info: {
            type: "short",
        },
    },
    // Question 6 (Select All That Apply)
    {
        prompt: "Which of the following activities does your pet enjoy?",
        info: {
            type: "select",
            options: ["Playing fetch 🎾", "Going for walks 🚶", "Chasing laser pointers 🔦", "Taking naps 😴"],
            matchingKeywords: ["loves playing fetch", "enjoys going for walks", "likes chasing laser pointers", "enjoys taking naps"]
        },
    },
    // Question 7
    {
        prompt: "How does your pet react to being groomed or bathed?",
        info: {
            type: "mc",
            options: ["Hates it and tries to escape 😾", "Tolerates it but doesn't enjoy it 😐", "Enjoys the attention and relaxes 😌", "Hasn't been groomed or bathed before 🤔"],
            matchingKeywords: ["resists and dislikes grooming or bathing", "endures grooming or bathing without enthusiasm", "relaxes and enjoys the grooming or bathing process", "lack of experience or uncertain about grooming or bathing"]
        },
    },
    // Question 8
    {
        prompt: "Is your pet more independent or clingy?",
        info: {
            type: "mc",
            options: ["Very independent and enjoys alone time 🐾", "Clingy and always wants to be near you 🤗", "Balances between independence and affectionate 🐾🤗", "Not sure yet, still figuring it out 🤔"],
            matchingKeywords: ["prefers independence and alone time", "craves constant companionship and attention", "has a balanced mix of independence and affection", "uncertain or still observing their behavior"]
        },
    },
    // Question 9
    {
        prompt: "Does your pet have any specific dietary restrictions or food allergies?",
        info: {
            type: "mc",
            options: ["Yes, they have dietary restrictions 🚫", "No, they can eat anything 🍽️", "Not sure, still figuring it out 🤔"],
            matchingKeywords: ["has specific dietary restrictions or allergies", "does not have any dietary restrictions or allergies", "uncertain or still observing their reactions to different foods"]
        },
    },
    // Question 10
    {
        prompt: "What is your pet's favorite spot for belly rubs?",
        info: {
            type: "short",
        },
    },
];