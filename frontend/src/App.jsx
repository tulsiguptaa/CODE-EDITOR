import { useState } from "react";
import Editor from "@monaco-editor/react";
import "./App.css";


function App() {

    const [language, setLanguage] = useState("cpp");

    const [code, setCode] = useState(
`#include <iostream>
using namespace std;

int binarySearch(int arr[], int n, int target) {
    
    // Write your solution here
    
    
}

int main() {

    int n;
    cin >> n;

    int arr[n];

    for(int i = 0; i < n; i++) {
        cin >> arr[i];
    }

    int target;
    cin >> target;

    cout << binarySearch(arr, n, target);

    return 0;
}`
    );

    const [input, setInput] = useState(
`5
1 3 5 7 9
5`
    );

    const [output, setOutput] = useState(
        "Run your code to see the output here..."
    );

    const [loading, setLoading] = useState(false);

    const [activeTab, setActiveTab] = useState("problem");

    const [timer, setTimer] = useState("29:42");


    const languages = {
        cpp: {
            name: "C++",
            id: 54
        },
        python: {
            name: "Python",
            id: 71
        },
        java: {
            name: "Java",
            id: 62
        },
        javascript: {
            name: "JavaScript",
            id: 63
        }
    };


  const runCode = async () => {
    setLoading(true);
    setOutput("Running code...");

    try {
        const response = await fetch(
            "http://127.0.0.1:8000/api/compiler/run/",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    code: code,
                    language_id: languages[language].id,
                    stdin: input,
                }),
            }
        );

        const result = await response.json();

        console.log("Judge0 Result:", result);

        // Django/backend error
        if (!response.ok) {
            setOutput(
                result.judge0_response ||
                result.details ||
                result.error ||
                "Something went wrong."
            );
            return;
        }

        // Compilation error
        if (result.compile_output) {
            setOutput(
                `COMPILATION ERROR\n\n${result.compile_output}`
            );
            return;
        }

        // Runtime error
        if (result.stderr) {
            setOutput(
                `RUNTIME ERROR\n\n${result.stderr}`
            );
            return;
        }

        // Successful execution
        if (result.stdout !== null && result.stdout !== undefined) {
            setOutput(
                result.stdout || "Program executed successfully with no output."
            );
            return;
        }

        setOutput("No output received.");

    } catch (error) {
        console.error(error);
        setOutput(`ERROR\n\n${error.message}`);
    } finally {
        setLoading(false);
    }
};

    const submitCode = () => {

        setOutput(
`✓ Submission received

Running hidden test cases...

Test Case 1     ✓ Passed
Test Case 2     ✓ Passed
Test Case 3     ✓ Passed
Test Case 4     ✓ Passed

4 / 4 test cases passed.`
        );

    };


    return (

        <div className="app">


            {/* ================= TOP NAVBAR ================= */}

            <header className="navbar">

                <div className="brand">

                    <div className="brand-icon">
                        AI
                    </div>

                    <div>
                        <h2>CodeInterview</h2>

                        <span>
                            AI Technical Interview
                        </span>
                    </div>

                </div>


                <div className="interview-info">

                    <div className="question-count">

                        <span>QUESTION</span>

                        <strong>03 / 10</strong>

                    </div>


                    <div className="timer">

                        <span>⏱</span>

                        {timer}

                    </div>


                    <button className="end-btn">
                        End Interview
                    </button>

                </div>

            </header>


            {/* ================= MAIN AREA ================= */}

            <main className="workspace">


                {/* ================= LEFT PANEL ================= */}

                <aside className="problem-panel">


                    <div className="panel-tabs">

                        <button
                            className={
                                activeTab === "problem"
                                    ? "active"
                                    : ""
                            }

                            onClick={() =>
                                setActiveTab("problem")
                            }
                        >
                            Problem
                        </button>


                        <button
                            className={
                                activeTab === "hints"
                                    ? "active"
                                    : ""
                            }

                            onClick={() =>
                                setActiveTab("hints")
                            }
                        >
                            Hints
                        </button>

                    </div>


                    {activeTab === "problem" && (

                        <div className="problem-content">

                            <div className="difficulty">
                                MEDIUM
                            </div>


                            <h1>
                                Binary Search
                            </h1>


                            <p className="description">

                                Given a sorted array of integers
                                and a target value, implement a
                                binary search algorithm to find
                                the index of the target.

                            </p>


                            <h3>
                                Example
                            </h3>


                            <div className="example-box">

                                <div>
                                    <span>Input</span>

                                    <code>
                                        arr = [1,3,5,7,9]
                                        <br />
                                        target = 5
                                    </code>
                                </div>


                                <div>
                                    <span>Output</span>

                                    <code>
                                        2
                                    </code>
                                </div>

                            </div>


                            <h3>
                                Constraints
                            </h3>


                            <ul>

                                <li>
                                    1 ≤ n ≤ 10⁵
                                </li>

                                <li>
                                    Array is sorted
                                </li>

                                <li>
                                    Elements are integers
                                </li>

                            </ul>


                            <div className="ai-note">

                                <div className="ai-avatar">
                                    AI
                                </div>

                                <div>

                                    <strong>
                                        AI Interviewer
                                    </strong>

                                    <p>
                                        Think about how you
                                        can eliminate half
                                        of the search space
                                        at every step.
                                    </p>

                                </div>

                            </div>

                        </div>

                    )}


                    {activeTab === "hints" && (

                        <div className="hint-content">

                            <h3>💡 Hint 1</h3>

                            <p>
                                Instead of checking every
                                element, think about the
                                middle element.
                            </p>


                            <h3>💡 Hint 2</h3>

                            <p>
                                Compare the middle element
                                with the target and decide
                                which half to search.
                            </p>

                        </div>

                    )}

                </aside>


                {/* ================= RIGHT AREA ================= */}

                <section className="coding-area">


                    {/* EDITOR HEADER */}

                    <div className="editor-header">


                        <div className="file-name">

                            <span className="file-dot"></span>

                            solution.cpp

                        </div>


                        <div className="editor-actions">


                            <select

                                value={language}

                                onChange={(e) =>
                                    setLanguage(e.target.value)
                                }

                            >

                                {Object.entries(languages).map(
                                    ([key, lang]) => (

                                        <option
                                            key={key}
                                            value={key}
                                        >
                                            {lang.name}
                                        </option>

                                    )
                                )}

                            </select>


                            <button
                                className="run-btn"
                                onClick={runCode}
                                disabled={loading}
                            >

                                {loading
                                    ? "Running..."
                                    : "▶ Run"
                                }

                            </button>


                            <button
                                className="submit-btn"
                                onClick={submitCode}
                            >

                                Submit →

                            </button>

                        </div>

                    </div>


                    {/* MONACO EDITOR */}

                    <div className="editor">

                        <Editor

                            height="100%"

                            language={language}

                            value={code}

                            onChange={(value) =>
                                setCode(value || "")
                            }

                            theme="vs-dark"

                            options={{

                                fontSize: 15,

                                lineHeight: 23,

                                minimap: {
                                    enabled: false
                                },

                                automaticLayout: true,

                                scrollBeyondLastLine: false,

                                padding: {
                                    top: 15
                                },

                                suggestOnTriggerCharacters: true,

                                tabSize: 4

                            }}

                        />

                    </div>


                    {/* TERMINAL */}

                    <div className="terminal">


                        <div className="terminal-header">


                            <div className="terminal-tabs">

                                <button className="terminal-active">
                                    Test Cases
                                </button>

                                <button>
                                    Custom Input
                                </button>

                                <button>
                                    Output
                                </button>

                            </div>


                            <span>
                                C++17
                            </span>

                        </div>


                        <div className="terminal-body">


                            <div className="input-column">

                                <label>
                                    INPUT
                                </label>

                                <textarea

                                    value={input}

                                    onChange={(e) =>
                                        setInput(e.target.value)
                                    }

                                />

                            </div>


                            <div className="output-column">

                                <label>
                                    OUTPUT
                                </label>

                                <pre>
                                    {output}
                                </pre>

                            </div>

                        </div>


                    </div>


                    {/* STATUS BAR */}

                    <div className="status-bar">

                        <div>

                            <span className="online-dot"></span>

                            Compiler Online

                        </div>


                        <div>

                            C++17

                        </div>


                        <div>

                            UTF-8

                        </div>


                        <div>

                            Ln 18, Col 5

                        </div>

                    </div>


                </section>

            </main>


        </div>

    );

}


export default App;