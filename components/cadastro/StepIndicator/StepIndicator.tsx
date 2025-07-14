"use client";

import React from "react";
import { CheckIcon } from "lucide-react";

interface StepIndicatorProps {
  steps: { id: string; title: string }[];
  currentStepId: string;
}

export function StepIndicator({ steps, currentStepId }: StepIndicatorProps) {
  const currentIndex = steps.findIndex((step) => step.id === currentStepId);

  return (
    <div className="flex justify-center items-center w-full mb-12">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center text-center w-20">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg transition-all duration-300
                ${index < currentIndex ? "bg-green-500 text-white" : ""}
                ${
                  index === currentIndex
                    ? "bg-primary text-primary-foreground scale-110"
                    : ""
                }
                ${
                  index > currentIndex
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-400"
                    : ""
                }
              `}
            >
              {index < currentIndex ? <CheckIcon /> : index + 1}
            </div>
            <p
              className={`text-sm mt-2 font-medium transition-colors duration-300 truncate ${
                index <= currentIndex
                  ? "text-primary font-semibold"
                  : "text-gray-500"
              }`}
            >
              {step.title}
            </p>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`flex-1 h-1 transition-colors duration-300 ${
                index < currentIndex
                  ? "bg-green-500"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
