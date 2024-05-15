import { PlusIcon } from "lucide-react";

export default function RelatedQuestions({
  questions,
  onSelect,
}: {
  questions: string[];
  onSelect: (question: string) => void;
}) {
  return (
    <div className="divide-y border-t mt-2">
      {questions.map((question, index) => (
        <div
          key={`question-${index}`}
          className="flex cursor-pointer items-center py-2 font-medium justify-between "
          onClick={() => onSelect(question)}
        >
          <span>{question.toLowerCase()}</span>
          <PlusIcon className="text-tint mr-2" size={20} />
        </div>
      ))}
    </div>
  );
}
