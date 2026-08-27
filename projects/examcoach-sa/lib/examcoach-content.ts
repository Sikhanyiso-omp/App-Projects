export type LessonContent = {
  outcome: string;
  meaning: string[];
  method: { title: string; detail: string; code?: string }[];
  example: { prompt: string; steps: string[]; answer: string };
  mistake: string;
  check: { prompt: string; options: string[]; answer: number; explanation: string };
};

export const moduleSeed = {
  slug: "csp26w2-test-booster",
  code: "CSP26W2",
  title: "Data Structures Test Booster",
  description: "Method-aligned preparation for algorithm analysis, recurrences, stacks and queues.",
  institution: "Walter Sisulu University",
  assessmentLabel: "Test 1",
  priceCents: 4900,
};

export const lessonSeeds: Array<{
  slug: string;
  title: string;
  topic: string;
  summary: string;
  minutes: number;
  position: number;
  isPreview: boolean;
  content: LessonContent;
}> = [
  {
    slug: "time-complexity-foundations",
    title: "Time complexity foundations",
    topic: "Algorithm analysis",
    summary: "Understand input size, basic operations and why we count growth instead of seconds.",
    minutes: 11,
    position: 1,
    isPreview: true,
    content: {
      outcome: "Identify the input size and count how many times the dominant operation executes.",
      meaning: [
        "Time complexity describes how an algorithm's work grows when the input gets larger.",
        "We count a basic operation such as a comparison or assignment instead of measuring seconds, because different computers run at different speeds.",
      ],
      method: [
        { title: "Choose the input size", detail: "State what n represents in this algorithm." },
        { title: "Choose the dominant operation", detail: "Usually the operation repeated inside the loop." },
        { title: "Count its executions", detail: "Write the count in terms of n." },
        { title: "Keep the fastest-growing term", detail: "Ignore constant multipliers and smaller terms for Big-O." },
      ],
      example: {
        prompt: "Analyse: for (int i = 0; i < n; i++) cout << i;",
        steps: [
          "The input size is n.",
          "The loop condition is checked n + 1 times.",
          "The increment and cout each execute n times.",
          "T(n) = 1 + (n + 1) + n + n = 3n + 2.",
        ],
        answer: "The growth is linear, so the time complexity is O(n).",
      },
      mistake: "Do not write O(3n + 2). Big-O keeps only the fastest-growing term and removes its constant multiplier.",
      check: {
        prompt: "If a statement executes exactly 2n + 5 times, what is its Big-O complexity?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
        answer: 2,
        explanation: "The n term dominates and its constant multiplier is ignored, giving O(n).",
      },
    },
  },
  {
    slug: "counting-loop-operations",
    title: "Counting loop operations",
    topic: "Algorithm analysis",
    summary: "Count initialisation, comparisons, updates and body operations without missing the final check.",
    minutes: 14,
    position: 2,
    isPreview: false,
    content: {
      outcome: "Derive a simple T(n) expression from loop components and classify its order.",
      meaning: [
        "A for-loop has four parts: initialisation, condition, body and update.",
        "When the body runs n times, the condition is normally checked n + 1 times because the final false check stops the loop.",
      ],
      method: [
        { title: "Initialisation", detail: "Count it once." },
        { title: "Condition", detail: "Count successful checks plus the final false check." },
        { title: "Body", detail: "Count every operation multiplied by the iterations." },
        { title: "Update", detail: "Count once per completed iteration." },
      ],
      example: {
        prompt: "Count operations in: for (int i=0; i<n; i++) sum += i;",
        steps: ["i=0: 1", "i<n: n+1", "sum += i: n", "i++: n", "Total: 3n+2"],
        answer: "T(n)=3n+2 and therefore O(n).",
      },
      mistake: "The condition is not checked only n times. Remember the last check where i = n and the condition becomes false.",
      check: {
        prompt: "A loop body runs n times. How many times is its i < n condition checked?",
        options: ["1", "n - 1", "n", "n + 1"],
        answer: 3,
        explanation: "There are n true checks and one final false check.",
      },
    },
  },
  {
    slug: "growth-rates-big-o",
    title: "Growth rates and Big-O",
    topic: "Algorithm analysis",
    summary: "Recognise constant, logarithmic, linear, linearithmic and quadratic growth.",
    minutes: 12,
    position: 3,
    isPreview: false,
    content: {
      outcome: "Classify common code patterns using standard asymptotic growth rates.",
      meaning: [
        "Big-O is an upper-bound description of how work grows.",
        "The code pattern—not the variable name—reveals the order.",
      ],
      method: [
        { title: "No input-dependent repetition", detail: "Usually O(1)." },
        { title: "Repeated doubling or halving", detail: "Usually O(log n)." },
        { title: "One full pass", detail: "Usually O(n)." },
        { title: "Nested full passes", detail: "Usually O(n²)." },
      ],
      example: {
        prompt: "Classify a loop where i starts at 1 and doubles while i < n.",
        steps: ["Values: 1, 2, 4, 8, ...", "After k iterations, i = 2^k.", "Stop when 2^k ≥ n.", "Therefore k ≥ log₂n."],
        answer: "The loop is O(log n).",
      },
      mistake: "A loop is not automatically O(n). Look at how the control variable changes.",
      check: {
        prompt: "What is the order of two nested loops that each run n times?",
        options: ["O(log n)", "O(n)", "O(n log n)", "O(n²)"],
        answer: 3,
        explanation: "The inner n operations run for each of the outer n iterations: n × n = n².",
      },
    },
  },
  {
    slug: "recurrence-substitution",
    title: "Recurrences by substitution",
    topic: "Recurrence relations",
    summary: "Expand a recurrence, identify its pattern and stop at the base case.",
    minutes: 16,
    position: 4,
    isPreview: false,
    content: {
      outcome: "Solve simple divide recurrences through repeated substitution.",
      meaning: [
        "A recurrence describes the current problem using a smaller version of the same problem.",
        "Substitution repeatedly replaces the smaller T term until a pattern and base case become visible.",
      ],
      method: [
        { title: "Write the recurrence", detail: "Keep the current non-recursive work visible." },
        { title: "Expand T once", detail: "Replace T(n/2) using the same formula." },
        { title: "Expand again", detail: "Use at least two expansions before guessing the pattern." },
        { title: "Apply the base case", detail: "Find how many halvings make the argument 1." },
      ],
      example: {
        prompt: "Solve T(n) = T(n/2) + n.",
        steps: ["T(n)=T(n/4)+n/2+n", "T(n)=T(n/8)+n/4+n/2+n", "The added work is n+n/2+n/4+...", "This geometric series is less than 2n."],
        answer: "T(n) is O(n).",
      },
      mistake: "Do not add n at every level unchanged. When substituting T(n/2), its own added work is n/2.",
      check: {
        prompt: "After two expansions of T(n)=T(n/2)+n, which terms appear?",
        options: ["T(n/4)+2n", "T(n/4)+n/2+n", "T(n/8)+n", "2T(n/2)+n"],
        answer: 1,
        explanation: "The first substitution replaces T(n/2) with T(n/4)+n/2.",
      },
    },
  },
  {
    slug: "stack-operations",
    title: "Stack operations and cost",
    topic: "Stacks",
    summary: "Trace push, pop, peek and array-stack states, then analyse their cost.",
    minutes: 13,
    position: 5,
    isPreview: false,
    content: {
      outcome: "Trace stack operations and state the time cost of each standard operation.",
      meaning: [
        "A stack is Last-In, First-Out (LIFO). Only the top element is directly inserted or removed.",
        "An array implementation stores the index of the top item.",
      ],
      method: [
        { title: "Push", detail: "Increase top and place the new value." },
        { title: "Pop", detail: "Read the top value and decrease top." },
        { title: "Peek", detail: "Read the top without removing it." },
        { title: "Check boundaries", detail: "Underflow is empty; overflow is full in a fixed array." },
      ],
      example: {
        prompt: "Start empty. push(4), push(7), pop(), push(9). What is on top?",
        steps: ["[4]", "[4,7]", "pop returns 7 → [4]", "push 9 → [4,9]"],
        answer: "The top is 9.",
      },
      mistake: "Do not remove from the bottom. That describes a queue operation, not stack pop.",
      check: {
        prompt: "What is the normal time complexity of peek()?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
        answer: 0,
        explanation: "The top index gives direct access, so peek is constant time.",
      },
    },
  },
  {
    slug: "queue-operations",
    title: "Queue operations and circular arrays",
    topic: "Queues",
    summary: "Trace enqueue and dequeue while understanding front, rear and wrap-around.",
    minutes: 15,
    position: 6,
    isPreview: false,
    content: {
      outcome: "Trace FIFO operations and update front and rear correctly in a circular queue.",
      meaning: [
        "A queue is First-In, First-Out (FIFO). New items join at the rear and leave from the front.",
        "A circular array reuses free positions at the beginning instead of shifting every item.",
      ],
      method: [
        { title: "Enqueue", detail: "Advance rear using modulo and store the value." },
        { title: "Dequeue", detail: "Read front and advance it using modulo." },
        { title: "Wrap around", detail: "Use (index + 1) % capacity." },
        { title: "Track size", detail: "Use size or a clear empty/full convention." },
      ],
      example: {
        prompt: "Capacity 5, rear index 4. Where does the next enqueue go?",
        steps: ["Compute (rear + 1) % capacity.", "(4 + 1) % 5 = 0.", "The rear wraps to index 0."],
        answer: "The next item is stored at index 0.",
      },
      mistake: "Do not confuse the physical array order with logical queue order after wrap-around.",
      check: {
        prompt: "Which end removes an item in an ordinary queue?",
        options: ["Rear", "Front", "Either end", "Middle"],
        answer: 1,
        explanation: "Dequeue removes the oldest item from the front.",
      },
    },
  },
];

export const questionSeeds = [
  { topic: "Algorithm analysis", prompt: "What is the order of a single loop that runs n times?", options: ["O(1)", "O(log n)", "O(n)", "O(n²)"], correctIndex: 2, explanation: "One full pass grows linearly.", difficulty: "easy", marks: 2 },
  { topic: "Algorithm analysis", prompt: "What is the order when i triples each iteration until n?", options: ["O(1)", "O(log n)", "O(n)", "O(n³)"], correctIndex: 1, explanation: "Repeated multiplication reaches n in logarithmically many steps.", difficulty: "medium", marks: 2 },
  { topic: "Algorithm analysis", prompt: "Two consecutive O(n) loops give which combined order?", options: ["O(1)", "O(n)", "O(n²)", "O(2ⁿ)"], correctIndex: 1, explanation: "Addition gives O(n+n)=O(n), not O(n²).", difficulty: "medium", marks: 2 },
  { topic: "Recurrence relations", prompt: "T(n)=T(n/2)+1 has which order?", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], correctIndex: 1, explanation: "There is constant work across log₂n levels.", difficulty: "medium", marks: 2 },
  { topic: "Recurrence relations", prompt: "In T(n)=T(n/2)+n, what work appears when T(n/2) is expanded?", options: ["T(n/4)+n", "T(n/4)+n/2", "T(n/2)+2n", "2T(n/4)"], correctIndex: 1, explanation: "Use the same recurrence with n replaced by n/2.", difficulty: "hard", marks: 3 },
  { topic: "Stacks", prompt: "Which error occurs when pop is called on an empty stack?", options: ["Overflow", "Underflow", "Collision", "Wrap-around"], correctIndex: 1, explanation: "Removing from an empty structure is underflow.", difficulty: "easy", marks: 2 },
  { topic: "Stacks", prompt: "push(2), push(5), push(8), pop(). What is now on top?", options: ["2", "5", "8", "Empty"], correctIndex: 1, explanation: "Pop removes 8, leaving 5 on top.", difficulty: "medium", marks: 2 },
  { topic: "Queues", prompt: "Which principle defines an ordinary queue?", options: ["LIFO", "FIFO", "Priority only", "Random order"], correctIndex: 1, explanation: "First inserted is first removed.", difficulty: "easy", marks: 2 },
  { topic: "Queues", prompt: "For capacity 6 and rear 5, (rear+1)%capacity equals?", options: ["0", "1", "5", "6"], correctIndex: 0, explanation: "(5+1)%6 = 0, which wraps to the start.", difficulty: "medium", marks: 2 },
  { topic: "Queues", prompt: "Why use a circular array for a queue?", options: ["To sort values", "To reuse empty positions", "To make every operation O(n)", "To remove the front"], correctIndex: 1, explanation: "Wrap-around reuses space without shifting all items.", difficulty: "medium", marks: 3 },
];
