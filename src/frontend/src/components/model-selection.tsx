"use client";
import * as React from "react";

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { LightningBoltIcon } from "@radix-ui/react-icons";
import {
    BrainIcon
} from "lucide-react";

type Model = {
  name: string;
  description: string;
  value: string;
  smallIcon: React.ReactNode;
  icon: React.ReactNode;
};

const models: Model[] = [
  {
    name: "Super Fast",
    description: "Groq/LLaMA3-70B",
    value: "llama3-70b",
    smallIcon: <LightningBoltIcon className="w-4 h-4 text-yellow-500" />,
    icon: <LightningBoltIcon className="w-5 h-5 text-yellow-500" />,
  },
  {
    name: "Powerful",
    description: "OpenAI/GPT-4o",
    value: "gpt-4o",
    smallIcon: <BrainIcon className="w-4 h-4 text-pink-500" />,
    icon: <BrainIcon className="w-5 h-5 text-pink-500" />,
  },
];

export function ModelSelection() {
  const defaultModel = models[0];
  const [selectedModel, setSelectedModel] = React.useState<Model>(defaultModel);
  return (
    <Select
      defaultValue={selectedModel.value}
      onValueChange={(value) => {
        const selected = models.find((model) => model.value === value);
        if (selected) {
          setSelectedModel(selected);
        }
      }}
    >
      <SelectTrigger className="w-fit space-x-2 bg-transparent outline-none border-none select-none focus:ring-0">
        <SelectValue>
          <div className="flex items-center space-x-2">
            {selectedModel.smallIcon}
            <span className="font-medium">{selectedModel.name}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="w-[300px]">
        <SelectGroup>
          {models.map((model) => (
            <SelectItem
              key={model.value}
              value={model.value}
              className="flex flex-col items-start p-2"
            >
              <div className="flex items-center space-x-2">
                {model.icon}
                <div className="flex flex-col">
                  <span className="font-bold">{model.name}</span>
                  <span className="text-muted-foreground">
                    {model.description}
                  </span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
