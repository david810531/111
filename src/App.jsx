import React, { useMemo, useState } from "react";
import { Calculator, RotateCcw, Delete, Ruler, Sigma } from "lucide-react";
import { motion } from "framer-motion";

export default function EngineeringCalculator() {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState("0");
  const [angleMode, setAngleMode] = useState("DEG");
  const [history, setHistory] = useState([]);

  const buttons = useMemo(
    () => [
      ["sin", "cos", "tan", "log"],
      ["ln", "√", "x²", "^"],
      ["(", ")", "π", "e"],
      ["7", "8", "9", "÷"],
      ["4", "5", "6", "×"],
      ["1", "2", "3", "−"],
      ["0", ".", "=", "+"],
    ],
    []
  );

  const append = (value) => {
    if (value === "=") return calculate();
    if (value === "π") return setExpression((prev) => prev + "π");
    if (value === "e") return setExpression((prev) => prev + "e");
    if (["sin", "cos", "tan", "log", "ln", "√"].includes(value)) {
      return setExpression((prev) => prev + `${value}(`);
    }
    if (value === "x²") return setExpression((prev) => prev + "^2");
    setExpression((prev) => prev + value);
  };

  const clearAll = () => {
    setExpression("");
    setResult("0");
  };

  const backspace = () => {
    setExpression((prev) => prev.slice(0, -1));
  };

  const factorial = (n) => {
    if (!Number.isInteger(n) || n < 0) throw new Error("factorial domain error");
    if (n > 170) throw new Error("factorial overflow");
    let value = 1;
    for (let i = 2; i <= n; i++) value *= i;
    return value;
  };

  const calculate = () => {
    try {
      if (!expression.trim()) return;

      const toRadians = angleMode === "DEG";
      let sanitized = expression
        .replaceAll("×", "*")
        .replaceAll("÷", "/")
        .replaceAll("−", "-")
        .replaceAll("π", "Math.PI")
        .replace(/\be\b/g, "Math.E")
        .replace(/√\(/g, "Math.sqrt(")
        .replace(/log\(/g, "Math.log10(")
        .replace(/ln\(/g, "Math.log(")
        .replace(/\^/g, "**");

      sanitized = sanitized.replace(/sin\(([^()]*)\)/g, (_, inner) =>
        toRadians ? `Math.sin((${inner})*Math.PI/180)` : `Math.sin(${inner})`
      );
      sanitized = sanitized.replace(/cos\(([^()]*)\)/g, (_, inner) =>
        toRadians ? `Math.cos((${inner})*Math.PI/180)` : `Math.cos(${inner})`
      );
      sanitized = sanitized.replace(/tan\(([^()]*)\)/g, (_, inner) =>
        toRadians ? `Math.tan((${inner})*Math.PI/180)` : `Math.tan(${inner})`
      );

      if (!/^[0-9+\-*/().,\s*MathPIElogsincotaqru]*$/.test(sanitized)) {
        throw new Error("invalid characters");
      }

      // eslint-disable-next-line no-new-func
      const value = Function("factorial", `\"use strict\"; return (${sanitized});`)(factorial);
      if (!Number.isFinite(value)) throw new Error("not finite");

      const formatted = Math.abs(value) >= 1e9 || (Math.abs(value) < 1e-6 && value !== 0)
        ? value.toExponential(8)
        : Number(value.toPrecision(12)).toString();

      setResult(formatted);
      setHistory((prev) => [{ expression, result: formatted }, ...prev].slice(0, 5));
    } catch (error) {
      setResult("Error");
    }
  };

  const quickConstants = [
    { label: "圓周率 π", value: "π" },
    { label: "重力加速度", value: "9.80665" },
    { label: "光速", value: "299792458" },
    { label: "氣體常數", value: "8.314462618" },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7f7] text-slate-700 flex items-center justify-center p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6"
      >
        <main className="bg-[#eef4f6] border border-[#d7e2e6] rounded-[2rem] shadow-sm p-5 sm:p-8">
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 text-[#517082] text-sm tracking-[0.22em] uppercase mb-2">
                <Calculator size={16} /> Engineering Calculator
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-[#314c5a] tracking-tight">工程計算機</h1>
            </div>
            <button
              onClick={() => setAngleMode(angleMode === "DEG" ? "RAD" : "DEG")}
              className="self-start sm:self-auto rounded-full border border-[#bfd0d6] bg-white/60 px-4 py-2 text-sm text-[#3d6172] hover:bg-white transition"
            >
              Angle: {angleMode}
            </button>
          </header>

          <section className="bg-[#f9fbfb] border border-[#dfe9ec] rounded-3xl p-5 mb-5">
            <div className="min-h-12 text-right text-[#81949b] text-lg break-all">{expression || "0"}</div>
            <div className="text-right text-4xl sm:text-5xl font-light text-[#2d4856] break-all mt-2">{result}</div>
          </section>

          <section className="grid grid-cols-[repeat(4,minmax(0,1fr))] gap-3">
            <button onClick={clearAll} className="col-span-2 calculator-control">
              <RotateCcw size={18} /> AC
            </button>
            <button onClick={backspace} className="calculator-control">
              <Delete size={18} /> DEL
            </button>
            <button onClick={() => append("/")} className="calculator-operator">/</button>

            {buttons.flat().map((label) => {
              const isOperator = ["÷", "×", "−", "+", "=", "^"].includes(label);
              const isFunction = ["sin", "cos", "tan", "log", "ln", "√", "x²", "(", ")", "π", "e"].includes(label);
              return (
                <button
                  key={label}
                  onClick={() => append(label)}
                  className={isOperator ? "calculator-operator" : isFunction ? "calculator-function" : "calculator-number"}
                >
                  {label}
                </button>
              );
            })}
          </section>
        </main>

        <aside className="space-y-5">
          <section className="bg-white/70 border border-[#dce7ea] rounded-[2rem] p-5 shadow-sm">
            <div className="flex items-center gap-2 text-[#416273] font-medium mb-4">
              <Ruler size={18} /> 常用工程常數
            </div>
            <div className="space-y-3">
              {quickConstants.map((item) => (
                <button
                  key={item.label}
                  onClick={() => setExpression((prev) => prev + item.value)}
                  className="w-full flex items-center justify-between rounded-2xl border border-[#e1eaed] bg-[#f7fafb] px-4 py-3 text-left hover:bg-[#edf5f7] transition"
                >
                  <span className="text-sm text-[#607985]">{item.label}</span>
                  <span className="text-sm font-mono text-[#315667]">{item.value}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white/70 border border-[#dce7ea] rounded-[2rem] p-5 shadow-sm">
            <div className="flex items-center gap-2 text-[#416273] font-medium mb-4">
              <Sigma size={18} /> 最近計算
            </div>
            {history.length === 0 ? (
              <p className="text-sm text-[#7a8f98] leading-6">尚無紀錄。完成計算後，這裡會保留最近 5 筆。</p>
            ) : (
              <div className="space-y-3">
                {history.map((item, index) => (
                  <button
                    key={`${item.expression}-${index}`}
                    onClick={() => {
                      setExpression(item.expression);
                      setResult(item.result);
                    }}
                    className="w-full text-left rounded-2xl border border-[#e1eaed] bg-[#f7fafb] px-4 py-3 hover:bg-[#edf5f7] transition"
                  >
                    <div className="text-xs text-[#8a9da5] truncate">{item.expression}</div>
                    <div className="text-base font-medium text-[#315667] truncate">= {item.result}</div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </aside>
      </motion.div>

      <style>{`
        .calculator-number,
        .calculator-function,
        .calculator-operator,
        .calculator-control {
          min-height: 58px;
          border-radius: 1.2rem;
          border: 1px solid #d7e2e6;
          transition: all 160ms ease;
          font-size: 1.05rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          box-shadow: 0 1px 0 rgba(49, 76, 90, 0.04);
        }
        .calculator-number {
          background: rgba(255,255,255,0.78);
          color: #2f4b59;
        }
        .calculator-function {
          background: #e5eef2;
          color: #466878;
        }
        .calculator-operator {
          background: #c9dbe3;
          color: #29495a;
          font-weight: 600;
        }
        .calculator-control {
          background: #f7fafb;
          color: #527080;
        }
        .calculator-number:hover,
        .calculator-function:hover,
        .calculator-operator:hover,
        .calculator-control:hover {
          transform: translateY(-1px);
          filter: brightness(1.02);
        }
        .calculator-number:active,
        .calculator-function:active,
        .calculator-operator:active,
        .calculator-control:active {
          transform: translateY(0px) scale(0.99);
        }
      `}</style>
    </div>
  );
}
