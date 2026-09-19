import { MathRenderer } from "@/components/math/math-renderer";

const examples = [
  {
    label: "Inline math",
    content: "Inline math: $f(x)=x^2$ and $\\alpha+\\beta=\\gamma$.",
  },
  {
    label: "Display sums and limits",
    content: `$$
\\sum_{i=1}^{n} a_i, \qquad \\prod_{k=1}^{m} b_k, \qquad \\lim_{n\\to\\infty} a_n
$$`,
  },
  {
    label: "Integral and supremum",
    content: `$$
\\int_0^1 f(x)\\,dx, \qquad \\sup_{x\\in A} f(x), \qquad \\inf_{x\\in A} f(x)
$$`,
  },
  {
    label: "Text expressions inside formulas",
    content: `$$
x=0 \quad \text{pour tout } x\in A
$$`,
  },
  {
    label: "Alternative text command",
    content: `$$
x=0 \quad \mbox{pour tout }x\in A.
$$`,
  },
  {
    label: "Aligned equations",
    content: `$$
\\begin{aligned}
\\frac{d}{dt}f(\\gamma(t))
&=df_{\\gamma(t)}(\\dot{\\gamma}(t))\\\\
&=df_{\\gamma(t)}(X_f)\\\\
&=-\\omega(X_f,X_f)\\\\
&=0.
\\end{aligned}
$$`,
  },
  {
    label: "Piecewise and matrices",
    content: `$$
\\begin{cases}
 x'=-y,\\
 y'=x.
\\end{cases}
\n\n
\\begin{pmatrix}
 a & b\\
 c & d
\\end{pmatrix}
$$`,
  },
  {
    label: "Enumerate structure",
    content: `\\begin{enumerate}
\\item Première question.
\\item Deuxième question.
\\item Texte avec $x^2$.
\\end{enumerate}`,
  },
  {
    label: "Itemize structure",
    content: `\\begin{itemize}
\\item Première remarque.
\\item Deuxième remarque.
\\item $\\sum_{i=1}^n a_i$.
\\end{itemize}`,
  },
  {
    label: "Document sections and proof",
    content: `\\section{Exercice}

Soit $M$ une variété différentielle et soit

$$
\\omega=\\sum_{i=1}^{n}dx_i\\wedge dy_i.
$$

\\begin{proof}
On écrit
$$
X_f=\\sum_{i=1}^{n}\left(-y_i\\frac{\\partial}{\\partial x_i}+x_i\\frac{\\partial}{\\partial y_i}\right).
$$
\\end{proof}`,
  },
];

export default function LatexTestPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">LaTeX renderer regression suite</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-900">Forum mathématique – rendu académique</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-stone-600">
          Ce tableau de bord vérifie les structures mathématiques et documentaires supportées par le moteur du forum.
          Les équations sont rendues avec KaTeX et les listes/sections sont transformées en HTML sémantique.
        </p>
      </div>

      <div className="space-y-6">
        {examples.map((example) => (
          <section key={example.label} className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">{example.label}</div>
            <div className="math-content">
              <MathRenderer content={example.content} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
