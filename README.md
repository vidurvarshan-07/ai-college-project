# 🚀 AI Campus Pathfinding & Autonomous Rover Simulator

An interactive, high-fidelity AI Pathfinding Simulator modeled for autonomous campus rovers navigating a bustling university campus. Built with React, Vite, and HTML5 Canvas with cybernetic HUD aesthetics, live algorithm diagnostics, and obstacle physics.

---

- **Algorithms Engine (A\*, BFS, DFS)**:
  - **A\* Search**: Evaluates **f(n) = g(n) + h(n)** in real-time with admissible heuristics (Manhattan, Euclidean, Octile) and optimal weighted terrain traversal.
  - **Breadth-First Search (BFS)**: Unweighted shortest-hop exploration via FIFO queue.
  - **Depth-First Search (DFS)**: Deep branch exploration via LIFO stack.
  - **Comparative Benchmark**: Side-by-side matrix comparing A*, BFS, and DFS runtime, nodes visited, and optimality.
  - **Dynamic Obstacle Replanning**: Real-time obstacle avoidance when new roadblocks appear during rover traversal.
- **Live Campus Blueprint**:
  - Modeled university buildings (AI Research Lab, Student Union, Tech Incubator, Robotics Foundry, Central Library, Quantum Computing Center, Cafeteria, etc.)
  - Interactive doors, campus terrain weights (Paved paths, Grass/Mud mud-traps, Heavy Traffic corridors)
- **Autonomous Rover Simulation**:
  - Live animated rover traversal with sound effects and canvas particle bursts
  - Mission presets & scenarios (Emergency battery delivery, drone landing escort, cafeteria supply run)
  - Dynamic obstacles: recursive division maze generation & custom drawing tools
- **Deep Analytics Console**:
  - Real-time step-by-step calculation log (g-cost, h-cost, f-cost, open/closed list metrics)
  - Algorithm comparison matrix (Nodes visited, execution time, path length, optimality score)
  - Interactive Node Inspector modal

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vanilla CSS (Glassmorphism & Cyberpunk HUD design)
- **Icons & FX**: Lucide React, Canvas Confetti, Web Audio API synth
- **Tooling**: Vite, Oxlint

---

## 🏃 Local Development

Clone the repository and install dependencies:

```bash
# Clone the repository
git clone https://github.com/vidurvarshan-07/ai-college-project.git

# Navigate into the project folder
cd ai-college-project

# Install dependencies
npm install

# Start local development server
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

---

## 🌐 Deployment (GitHub Pages)

This project is configured with GitHub Actions to automatically build and deploy the production bundle to GitHub Pages whenever changes are pushed to `main`.

---

## 📄 License

MIT License. Open for educational and research use.

