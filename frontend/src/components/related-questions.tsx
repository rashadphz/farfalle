import { PlusIcon } from "lucide-react";

export default function RelatedQuestions({
  questions,
}: {
  questions: string[];
}) {
  return (
    <div className="divide-y border-t mt-2">
      {questions.map((question, index) => (
        <div
          key={`question-${index}`}
          className="flex cursor-pointer items-center py-2 font-medium justify-between "
        >
          <span>{question.toLowerCase()}</span>
          <PlusIcon className="text-accent-foreground mr-2" size={20} />
        </div>
      ))}
    </div>
  );
}
