# Optics Simulator

This project is a JavaScript implementation of a ray tracer which is able to interact with plane and curved mirrors. The user can adjust scene settings and add objects including light beams, light rays, mirrors etc.

---

## Live Demo

[**Click here to open the live webpage**](https://compro72.github.io/Optics-Simulator/)

![Optics Simulator Webpage](main.png)

---

## Features

- **Interactive Objects:** All objects have draggable points for positioning.
- **Sources of Light:** Sources of light include a ray, beam and a point source.
- **Types of Mirrors:** The types of mirrors available is the plane mirror and the curved mirror.
- **Object Creation Menu:** Any of the objects can be created using the + menu.
- **Object Deletion Button:** Any of the objects can be deleted from the scene using the X button.
- **Scene Settings:** The global properties ray density, ray thickness and maximum ray bounces can be changed using sliders.

---

## Technical Description

The main architecture for managing the scene is an object oriented hierarchy system. The high level container class Scene, manages the light and mirror arrays containing all the scene objects. The objects include the class instances of PlaneMirror, CurvedMirror, Ray, Beam and PointSource. Beam and PointSource instances hold their own array of Ray instances. An update call, a render call and a renderUi call is passed through this hierarchy. For all the objects, the update call updates their drag points considering the user input. For exclusively light source objects, the mirrors array is passed into the update call for the rays to calculate their light path.

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
