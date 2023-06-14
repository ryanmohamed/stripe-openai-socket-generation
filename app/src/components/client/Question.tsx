import { Key } from "react"

type ImageInfo = {
    src: string,
    alt: string
}

type MultipleChoiceType = {
    type: "mc",
    options: [string, string, string, string],
}

type ShortAnswerType = {
    type: "short"
}

type SelectType = {
    type: "select",
    options: string[],
}

type QuestionType = {
    prompt: string,
    info: MultipleChoiceType | ShortAnswerType | SelectType
    image?: ImageInfo;
}

const MCForm = ({ info }: { info: MultipleChoiceType }) => {
    return (
        <form className="self-center flex flex-col w-full h-auto">
            <div className="self-center flex flex-col md:grid grid-cols-2 grid-rows-2 gap-2 w-full">
            { info.options.map((option: string, idx: number) => (
                <label htmlFor={`option${idx + 1}`} className="flex-grow mb-2 md:mb-0 px-4 py-2 rounded-full hover:cursor-pointer border-2 border-indigo-800 bg-stone-950 hover:scale-105 transition">
                    <input type="radio" id={`option${idx + 1}`} name="option" value={option} />
                    <span className="cursor-pointer ml-2 text-base whitespace-nowrap font-sans font-light text-stone-300 subpixel-antialiased">{option}</span>
                </label>
            )) }
            </div>
            <button className="btn flex-grow md:mt-8 mt-2 rounded-full bg-green-700 hover:bg-green-500" type="submit">Answer question</button>
        </form>
    );
}

const Question = ({ num, question }: {
    num: number,
    question: QuestionType
}) => {
    return (
        <div className="h-auto flex flex-col rounded-2xl">
            <h1 className="text-5xl mb-8 w-fit pb-2 border-b-2 border-stone-800">Question {num}</h1>
            <div className="px-10 flex flex-col">
                <p className="mb-4 w-full self-center">{question.prompt}</p>
                { question.image && <img className="shadow-black shadow-md mb-4 self-center max-w-[300px] h-auto rounded-2xl saturate-150 contrast-125 brightness-75" src={question.image.src} alt={question.image.alt} /> }
                { question.info.type === "mc" && <MCForm info={question.info} />}
            </div>
        </div>
    );
}

export default Question;