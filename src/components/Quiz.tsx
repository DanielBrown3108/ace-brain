"use client";

import { useState } from "react";

export type QuizChoice = {
  id: string;
  body: string;
  is_correct: boolean;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  explanation: string | null;
  question_type: "multiple_choice" | "short_answer";
  answer_key: string | null;
  choices: QuizChoice[];
};

type Props = {
  questions: QuizQuestion[];
};

export function Quiz({ questions }: Props) {
  if (questions.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold tracking-tight">
        Check your understanding
      </h2>
      <p className="mt-1 text-sm text-neutral-600">
        {questions.length === 1 ? "1 question" : `${questions.length} questions`} ·
        instant feedback, no grading.
      </p>
      <div className="mt-6 space-y-6">
        {questions.map((q, i) =>
          q.question_type === "short_answer" ? (
            <ShortAnswer key={q.id} index={i + 1} question={q} />
          ) : (
            <MultipleChoice key={q.id} index={i + 1} question={q} />
          )
        )}
      </div>
    </section>
  );
}

function MultipleChoice({
  index,
  question,
}: {
  index: number;
  question: QuizQuestion;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const correctId = question.choices.find((c) => c.is_correct)?.id;
  const isCorrect = submitted && selected === correctId;

  return (
    <div className="rounded-2xl border border-neutral-200 p-5">
      <p className="font-medium">
        <span className="mr-2 text-neutral-400">{index}.</span>
        {question.prompt}
      </p>

      <div className="mt-4 space-y-2">
        {question.choices.map((c) => {
          const isSelected = selected === c.id;
          const showCorrect = submitted && c.id === correctId;
          const showWrongPick = submitted && isSelected && !c.is_correct;

          return (
            <label
              key={c.id}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition ${
                showCorrect
                  ? "border-blue-500 bg-blue-50"
                  : showWrongPick
                    ? "border-red-400 bg-red-50"
                    : isSelected
                      ? "border-neutral-400 bg-neutral-50"
                      : "border-neutral-200 hover:bg-neutral-50"
              }`}
            >
              <input
                type="radio"
                name={`q-${question.id}`}
                value={c.id}
                checked={isSelected}
                onChange={() => {
                  if (!submitted) setSelected(c.id);
                }}
                className="accent-blue-700"
              />
              <span>{c.body}</span>
              {showCorrect && (
                <span className="ml-auto text-xs font-medium text-blue-700">
                  Correct
                </span>
              )}
              {showWrongPick && (
                <span className="ml-auto text-xs font-medium text-red-700">
                  Not quite
                </span>
              )}
            </label>
          );
        })}
      </div>

      <Footer
        submitted={submitted}
        isCorrect={isCorrect}
        canCheck={!!selected}
        onCheck={() => setSubmitted(true)}
        onReset={() => {
          setSelected(null);
          setSubmitted(false);
        }}
        explanation={question.explanation}
      />
    </div>
  );
}

function ShortAnswer({
  index,
  question,
}: {
  index: number;
  question: QuizQuestion;
}) {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const acceptable = (question.answer_key ?? "")
    .split("|")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const isCorrect =
    submitted && acceptable.includes(value.trim().toLowerCase());

  return (
    <div className="rounded-2xl border border-neutral-200 p-5">
      <p className="font-medium">
        <span className="mr-2 text-neutral-400">{index}.</span>
        {question.prompt}
      </p>

      <input
        type="text"
        value={value}
        onChange={(e) => {
          if (!submitted) setValue(e.target.value);
        }}
        placeholder="Type your answer..."
        disabled={submitted}
        onKeyDown={(e) => {
          if (e.key === "Enter" && value.trim() && !submitted) {
            e.preventDefault();
            setSubmitted(true);
          }
        }}
        className={`mt-4 w-full rounded-lg border px-3 py-2 text-sm transition ${
          submitted
            ? isCorrect
              ? "border-blue-500 bg-blue-50"
              : "border-red-400 bg-red-50"
            : "border-neutral-300"
        }`}
      />

      {submitted && !isCorrect && acceptable.length > 0 && (
        <p className="mt-2 text-sm text-neutral-700">
          Acceptable answer{acceptable.length > 1 ? "s" : ""}:{" "}
          <span className="font-medium text-blue-700">
            {acceptable.join(", ")}
          </span>
        </p>
      )}

      <Footer
        submitted={submitted}
        isCorrect={isCorrect}
        canCheck={value.trim().length > 0}
        onCheck={() => setSubmitted(true)}
        onReset={() => {
          setValue("");
          setSubmitted(false);
        }}
        explanation={question.explanation}
      />
    </div>
  );
}

function Footer({
  submitted,
  isCorrect,
  canCheck,
  onCheck,
  onReset,
  explanation,
}: {
  submitted: boolean;
  isCorrect: boolean;
  canCheck: boolean;
  onCheck: () => void;
  onReset: () => void;
  explanation: string | null;
}) {
  return (
    <>
      <div className="mt-4 flex items-center gap-3">
        {!submitted ? (
          <button
            type="button"
            disabled={!canCheck}
            onClick={onCheck}
            className="rounded-full bg-blue-700 px-5 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
          >
            Check answer
          </button>
        ) : (
          <button
            type="button"
            onClick={onReset}
            className="rounded-full border border-neutral-300 px-5 py-2 text-sm font-medium hover:bg-neutral-50"
          >
            Try again
          </button>
        )}
        {submitted && (
          <span
            className={`text-sm font-medium ${
              isCorrect ? "text-blue-700" : "text-red-700"
            }`}
          >
            {isCorrect ? "Nice." : "Read the explanation below."}
          </span>
        )}
      </div>

      {submitted && explanation && (
        <div className="mt-4 rounded-lg bg-neutral-50 p-3 text-sm text-neutral-700">
          <span className="font-medium">Why: </span>
          {explanation}
        </div>
      )}
    </>
  );
}
