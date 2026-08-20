# Optics Simulator

This project is a JavaScript implementation of a ray tracer which is able to interact with plane and curved mirrors. The user can adjust scene settings and add objects including light beams, light rays, mirrors etc.

---

## Live Demo

[**Click here to open the live webpage**](https://compro72.github.io/Optics-Simulator/)

![Optics Simulator Webpage](main.png)

---

## Features

- **Interactive Cube:** A 2D and 3D interactive 2x2 Rubik's Cube built with CSS transforms.
- **Random Scrambler:** A cube scrambler for testing the solver.
- **Optimal Search:** A bi-directional breadth-first search implementation for finding the optimal solution.
- **Pre-computed search Tree:** Pre-computed search tree for the first 7 moves from the solved state.
- **Visual Move Guide:** Automatically generated images for an intuitive visual solution.
- **Move-set Reduction:** Automatic orientation normalization to reduce the branching factor of the search from 18 to 9.

---

## Technical Description

The move system used in this solver is **Half Turn Metric (HTM)**. HTM contains all faces $U$, $R$, $F$, $D$, $L$, $B$ and includes clockwise, counterclockwise, and double rotations. 

On a 2x2 cube, half of these rotations are simply the same as turning the opposite face in the same direction. For example, making a clockwise $R$ turn or making a clockwise $L$ turn yields the same final combination, with the only difference being the orientation of the physical cube. 

To solve this problem intuitively, this solver fixes the $U/R/F$ corner into a static position for the entire solve. By doing this, only $D$, $L$, $B$ moves are required. 

For the solve algorithm itself:
1. The solver contains a pre-computed search tree which holds all combinations **7 moves away from the solved state**. This tree is stored in `data.js`.
2. At the first stage of the algorithm, the solver simply checks the pre-computed tree for the input cube. If found, it simply returns this solution.
3. If the solution is not found in the first stage, the solver generates another tree with the root node being the input cube. 
4. Since God's Number for a 2x2 cube is **11**, the solver only has to search **4 moves away** from the input cube to guarantee finding a state from the pre-computed search tree.
5. Now, the solver iterates through each depth from the newly generated tree until a combination is found in the final depth (depth 7) of the pre-computed tree. Since there are two trees and nodes are processed in order of depth, this type of search algorithm is a **bi-directional breadth-first search**.

---

## Future Improvements

There are many major improvements that can be made to this search algorithm:

* **Breath-First Search:** A queue data structure could be used to cleanly search the state space rather than generating a tree and then iteratively searching it.
* **Heuristic Search:** One of the biggest improvements that drastically reduces the memory usage is to remove the pre-computed search tree and use admissible heuristics to guide the search. These heuristics could also be pre-computed but would be much smaller in size than an entire search tree.
* **Uniform Scrambler:** The cube scrambler could be improved to be uniformly random across all possible states by mathematically rearranging the corner pieces instead of simply taking some amount of random moves.

---

## How to Run Locally
1. Clone this repository or download the code.
2. Open `index.html` in any web browser.
