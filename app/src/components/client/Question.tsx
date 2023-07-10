import useRoomContext from "@/hooks/useRoomContext"
import useSocketContext from "@/hooks/useSocketContext"
import { ChangeEventHandler, Context, createContext, Dispatch, FormEvent,  ReactNode, SetStateAction, useContext, useEffect, useState } from "react"

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

type MCFormProps = { info: MultipleChoiceType, ctx: Context<QuestionContextType> };
type SelectFormProps = { info: SelectType, ctx: Context<QuestionContextType> };
type ShortAnswerFormProps = { ctx: Context<QuestionContextType> };


const MCForm = ({ info, ctx }: MCFormProps) => {
    const { disabled } = useContext(ctx);
    const [ answer, setAnswer ] = useState<number | null>(null);
    const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
        const checked = event.target.checked;
        if (checked) setAnswer((Number(event.target.id.slice(6)) - 1) as number);
    }
    return (
        <GenericForm ctx={ctx} answer={info.options[answer || 0] || ""}>
            <div className="self-center flex flex-col gap-2 w-full">
            { info.options.map((option: string, idx: number) => (
                <label key={idx} htmlFor={`option${idx + 1}`} className="flex-grow mb-2 md:mb-0 px-4 py-2 rounded-sm hover:cursor-pointer border-2 border-indigo-950 bg-stone-950 hover:scale-105 transition">
                    <input disabled={disabled}  onChange={handleChange} type="radio" id={`option${idx + 1}`} name="option" value={option} defaultChecked={false} />
                    <span className="cursor-pointer ml-2 text-base whitespace-nowrap font-sans font-light text-stone-300 subpixel-antialiased">{option}</span>
                </label>
            )) }
            </div>
        </GenericForm>
    );
}

const SelectForm = ({ info, ctx }: SelectFormProps) => {
    const { disabled } = useContext(ctx);
    const [answers, setAnswers] = useState<any>([null, null, null, null]);
    const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
        const checked = event.target.checked;
        const idx = (Number(event.target.id.slice(6))) as number;
        const cpy = [...answers];
        cpy[idx] = checked ? event.target.value : null;
        setAnswers(cpy);
    }
    return (
        <GenericForm ctx={ctx} answer={[...answers].join(", ") || ""}>
            <div className="self-center flex flex-col gap-2 w-full">
            { info.options.map((option: string, idx: number) => (
                <label key={idx} htmlFor={`option${idx}`} className="flex-grow mb-2 md:mb-0 px-4 py-2 rounded-sm hover:cursor-pointer border-2 border-indigo-950 bg-stone-950 hover:scale-105 transition">
                    <input disabled={disabled} onChange={handleChange} type="checkbox" id={`option${idx}`} name={`option`} value={option} defaultChecked={false}/>
                    <span className="cursor-pointer ml-2 text-base whitespace-nowrap font-sans font-light text-stone-300 subpixel-antialiased">{option}</span>
                </label>
            )) }
            </div>
        </GenericForm>
    );
}

const ShortAnswerForm = ({ ctx }: ShortAnswerFormProps) => {
    const { disabled } = useContext(ctx);
    const [answer, setAnswer] = useState<string | null>(null);
    const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
        const answer = event.target.value;
        setAnswer(answer);
    }
    return (
        <GenericForm ctx={ctx} answer={answer || ""}>
            <div className="mt-4 self-center w-full">
                <label htmlFor="short-answer" className="font-poppins text-white text-base">
                    Enter your answer:
                </label>
                <input 
                    disabled={disabled}
                    className="my-2 w-full h-12 text-center rounded-full text-lg text-stone-950"
                    onChange={handleChange} 
                    type="text" 
                    id="short-answer" 
                    name="short-answer" 
                    placeholder="(e.g: Fluffy)" 
                />
            </div>
        </GenericForm>
    );
}

const GenericForm = ({ ctx, answer, children }: { ctx: Context<QuestionContextType>, answer: string, children?: ReactNode }) => {
    const { disabled, setDisabled, handleSubmit } = useContext(ctx);
    return (
        <form onSubmit={(e) => handleSubmit(e, answer)} className={`self-center flex flex-col w-full h-auto ${disabled && "cursor-not-allowed"}`}>
            { children }
            <button disabled={disabled} className={`btn flex-grow mt-4 rounded-full bg-green-700 hover:bg-green-500 ${disabled ? "hover:cursor-not-allowed" : "hover:cursor-pointer"}`} type="submit">Answer question</button>
        </form>
    );
}

type HandleSubmitType = (event: FormEvent<HTMLFormElement>, answer: string) => void;

interface QuestionContextType {
    disabled: boolean;
    setDisabled: Dispatch<SetStateAction<boolean>>;
    handleSubmit: HandleSubmitType;
}

const Question = ({ num, question }: {
    num: number | null | undefined,
    question: QuestionType
}) => {
    const { socket } = useSocketContext();
    const [ disabled, setDisabled ] = useState<boolean>(false);
    const { roomData } = useRoomContext();
    
    const handleSubmit: HandleSubmitType = (event, answer) => {
        event.preventDefault();
        if(answer.length !== 0) {
            setDisabled(true);
            socket?.emit("action:answer-question", answer);
        }
    }

    const QuestionContext = createContext<QuestionContextType>({
        disabled: disabled,
        setDisabled: setDisabled,
        handleSubmit: handleSubmit
    });
    
    useEffect(() => {
        setDisabled(false);
    }, [question]);

    return (
        <div className="w-full relative border-b-[1px] border-stone-800 py-10 md:px-10">
            <h1 className="text-4xl font-semibold tracking-wide mb-4 w-fit pb-2 text-gray-300">Question {num}</h1>
            <div className="flex flex-col">
                <p className="mb-4 w-full self-center">{question.prompt}</p>
                { question.image && <img className="shadow-black shadow-md mb-4 self-center max-w-[300px] h-auto rounded-2xl saturate-150 contrast-125 brightness-75" src={question.image.src} alt={question.image.alt} /> }
                <QuestionContext.Provider value={{ disabled, setDisabled, handleSubmit }}>
                    { question.info.type === "mc" && <MCForm info={question.info} ctx={QuestionContext} />}
                    { question.info.type === "short" && <ShortAnswerForm ctx={QuestionContext}/>}
                    { question.info.type === "select" && <SelectForm info={question.info} ctx={QuestionContext} />}
                </QuestionContext.Provider>
            </div>
        </div>
    );
}

export default Question;