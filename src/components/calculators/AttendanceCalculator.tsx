"use client";

import { useMemo, useState } from "react";
import { calculateAttendance } from "@/lib/calculators/attendance";
import { formatNumber, formatPercent, parseNumberInput } from "@/lib/calculators/format";
import { NumberField } from "@/components/calculators/fields/NumberField";
import { CalculatorFrame } from "@/components/calculators/CalculatorFrame";
import { ResultCard } from "@/components/calculators/ResultCard";
import { HowToUse } from "@/components/calculators/HowToUse";
import { ExamplesBlock } from "@/components/calculators/ExamplesBlock";

export function AttendanceCalculator() {
  const [total, setTotal] = useState("");
  const [attended, setAttended] = useState("");
  const [target, setTarget] = useState("75");

  const { error, data } = useMemo(() => {
    const t = parseNumberInput(total);
    const a = parseNumberInput(attended);
    const tgt = parseNumberInput(target);
    if (t === null || a === null || tgt === null) return { error: null, data: null };

    const result = calculateAttendance({ totalClasses: t, attendedClasses: a, targetPercent: tgt });
    if (!result.ok) return { error: result.error, data: null };

    return { error: null, data: result.result };
  }, [total, attended, target]);

  function handleReset() {
    setTotal("");
    setAttended("");
    setTarget("75");
  }

  return (
    <div>
      <CalculatorFrame
        fields={
          <>
            <NumberField id="att-total" label="Total classes held" value={total} onChange={setTotal} />
            <NumberField id="att-attended" label="Classes attended" value={attended} onChange={setAttended} />
            <NumberField
              id="att-target"
              label="Required attendance"
              value={target}
              onChange={setTarget}
              suffix="%"
              hint="Most institutions require 75%."
            />
          </>
        }
        onReset={handleReset}
        result={
          error ? (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          ) : data ? (
            <div className="space-y-4">
              <ResultCard
                label="Current attendance"
                value={formatPercent(data.currentPercent)}
                description={`${formatNumber(data.missedClasses, 0)} classes missed so far. ${
                  data.meetsTarget ? "You're meeting the target." : "You're below the target."
                }`}
                copyText={formatPercent(data.currentPercent)}
                tone={data.meetsTarget ? "teal" : "amber"}
              />

              {data.targetImpossible && (
                <p role="alert" className="text-sm text-danger">
                  {data.targetImpossible}
                </p>
              )}

              {data.classesNeededToReachTarget !== null && (
                <ResultCard
                  label="Classes needed to reach target"
                  value={`${formatNumber(data.classesNeededToReachTarget, 0)} more`}
                  description="Assumes you attend every class from now on."
                />
              )}

              {data.maxClassesCanMiss !== null && (
                <ResultCard
                  label="Classes you can still miss"
                  value={formatNumber(data.maxClassesCanMiss, 0)}
                  description="While staying at or above your target, going forward."
                />
              )}
            </div>
          ) : (
            <p className="text-sm text-ink/45">Enter your class counts to see your attendance.</p>
          )
        }
      />

      <HowToUse
        steps={[
          "Enter the total number of classes held so far and how many you attended.",
          "Enter the attendance percentage your institution requires (75% is common).",
          "See your current percentage, plus how many more classes you can miss — or need to attend — to hit that target.",
        ]}
      />

      <ExamplesBlock
        examples={[
          { input: "34 of 40 classes, 75% target", output: "85% — meeting target" },
          { input: "6 of 10 classes, 75% target", output: "Need 6 more classes" },
          { input: "9 of 10 classes, 75% target", output: "Can miss 2 more" },
        ]}
      />
    </div>
  );
}

export default AttendanceCalculator;
