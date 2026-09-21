# Prototype Evaluation

## 1. Overview

This document records the evaluation of our prototype as part of the iterative design process.

The purpose of the evaluation was to investigate whether the prototype effectively supports the core experience identified through our research and experience requirement studies.
The evaluation should be focussed on the usability and usefulness of the prototype and whether the prototype addressed the problems identified during our earlier research.

---

## 2. Evaluation Objectives

The evaluation aims to investigate:

- Whether users could understand how to participate in a shared cooking session.
- Whether users could understand their assigned cooking tasks.
- Whether users could understand what other participants were doing.
- Whether shared progress helped users coordinate during cooking.
- Whether the cooking instructions were clear and easy to follow.
- Whether the interaction supported collaboration rather than requiring one person to manage the entire cooking process.
- Whether any parts of the prototype caused confusion, friction, or unnecessary interaction.
- What changes should be made to the prototype based on user feedback.

---

## 3. Prototype Version

### **1. Prototype:** Low Fidelity / version 1.0

**Date evaluated:** [15 September 2026]

**Prototype link:** [Link](docs\design\table 18 low fi prototype.pdf)

### Features included in this evaluation

- Scan Kitchen
- Personalised Voice Commands
- Cooking Lobby
- Meal Selection
- Task Setup
- Cooking Mode
- Group Progress
- Help Others

### Simulated features

The following components were simulated rather than fully implemented:

- Scan Kitchen
- Personalised Voice Commands
- Cooking Lobby

These components were simulated because they were not central to the interaction being evaluated.

### **2. Prototype:** High Fidelity / version 1.0

**Date evaluated:** [18 September 2026]

**Prototype link:** [Link](https://www.figma.com/design/3OTwrEJZ7nNwccutJz0rSv/Table-18)

### Features included in this evaluation

- Cooking Lobby
- Meal Selection
- Task Setup
- Cooking Mode
- Group Progress
- Help Others


---

## 4. Evaluation Method

### 4.1 Participant(s)

**Number of participants:** 5

**Participant type:** Target Users / Developers

**Recruitment:** The initial evaluation of both the prototypes was conducted internally within the team and cross referenced while analysis existing user interviews and research literature.

> Participant identities are anonymised in this documentation.

---

### 4.2 Evaluation Approach

We used an informal semi-structured feedback approach to evaluate the prototypes. As the prototypes consisted of low fidelity OneNote sketches and high fidelity Figma wireframes, and the evaluation focused on gathering people's opinions and initial reactions to the proposed features and interaction ideas rather than measuring usability or task performance.

Participants were shown a scenario representing a typical collaborative cooking situation:

> "You and several friends who live together want to cook a meal together. You have decided what you want to cook and are about to start preparing the meal in a shared kitchen. The app is intended to help you organise the cooking session, divide the cooking tasks, follow your individual instructions, see the group's progress, and help other participants when you finish your own task."

Participants were then walked through the relevant screens and feature concepts in the prototype and asked for their opinions, including whether the proposed interactions were understandable, useful, or confusing. Feedback was also gathered on specific concepts such as task assignment and swapping, the cooking lobby, meal preferences, shared cooking progress, hands-free interaction, helping other participants, and the proposed kitchen-scanning concept.

### 4.3 Evaluation Questions

The evaluation investigated the following questions:

1. Can users understand how to join and participate in a shared cooking session?

2. Can users understand how a cooking lobby could be used to organise a group before cooking?

3. Can users understand how meal preferences could be used when selecting a meal for the group?

4. Can users understand how the meal is divided into individual cooking tasks?

5. Do users understand what their assigned task requires them to do?

6. Can users understand the option to claim or swap cooking tasks?

7. Are the individual cooking instructions clear and easy to follow?

8. Would users find hands-free interaction, such as saying "Next step", useful while cooking?

9. Can users understand how the system could allow them to help another participant after completing their own task?

10. Can users understand the purpose of the shared group progress view?

11. Does showing the status of other participants help users understand what is happening during the cooking session?

12. Does the proposed experience support collaboration between participants rather than making each person feel like they are cooking independently?

13. Does the proposed kitchen-scanning concept make sense as a way of supporting coordination in a shared kitchen?

14. Which parts of the proposed experience are confusing, unnecessary, or difficult to understand?

15. What changes should be made to the prototype before developing the next iteration?

---

## 5. Observations and Results

#### Finding 1: No "Claim Task" Option

**Observation:** Since user interviews indicate that task division is inconsistent while cooking colaboritvely and the app giving them a baseline division of tasks with an option to **swap** tasks if needed.

**Implication:**

The app should initially divide tasks automatically instead of having a "CLAIM" button and later if the useres with to change their tasks they can swap between themseleves seamlessly.

---

#### Finding 2: Changes to Personalised Voice Commands 

**Observation:** Instead of having the app trains itself to recognise the specific user's voice, which would be a technical endevour likely beyond the scope of the project, the team decided to give users the option to "name" their app and thus give unique voice commands accordingly which is much more plausible to implement given our prent project scope.

**Implication:**

Personalised voice commands as a feature will now be replaced by the ability to rename the app for each user and have the app reconise voice commands directed at said name.

---

#### Finding 3: Find Friends View

**Observation:** The team identified the need to implement a "Find Friends" menu in order to make it easy for users to find each other when they're gathered in the kitchen and ready to cook

**Implication:**

The team is now thinking to implement the "Find Friends" menu in the form of a map interface that highlights oither online users in the vicinity and this would be the menu right befor the cooking lobby.

---

## 6. Analysis

The evaluation findings were analysed against the experience requirements identified from our earlier research.

### Key insights

Based on the evaluation, we identified the following key insights:

1. **Task assignment should provide an initial structure while remaining flexible.**  
   The prototype should provide users with an initial division of cooking tasks rather than requiring participants to manually claim tasks. However, users should still be able to swap tasks between themselves when necessary. This supports the project's goal of reducing uncertainty around role while at the same time allowing participants to adapt the division of work to their preferences and circumstances.

2. **Personalisation should be achievable within the scope of the prototype.**  
   The original concept of training the system to recognise each user's individual voice was identified as technically ambitious for the current project scope. The design was therefore revised to explore a simpler form of personalisation, where users can give their cooking assistant a custom name and use that name when issuing commands.

3. **Joining a cooking session requires a clear social interaction before the lobby.**  
   The current prototype assumes that users can join a cooking group, but the process of finding and connecting with other participants was not sufficiently defined. This led to the proposed addition of a "Find Friends" interaction before the cooking lobby.

4. **The physical context of the kitchen remains an important part of the concept.**  
   The proposed kitchen-scanning interaction connects the digital cooking experience with the physical environment in which the cooking takes place. However, the interaction needs to remain focused on supporting coordination rather than making computer vision the central purpose of the application.

5. **The prototype is moving towards a balance between automation and user control.**  
   The proposed changes suggest that the system should handle repetitive organisational work, such as providing an initial task division, while allowing participants to make their own adjustments when necessary.

---

## 7. Limitations

The evaluation had the following limitations:

1. **Several proposed interactions have not yet been technically implemented.**  
   Features such as task assignment, voice interaction, kitchen scanning, and finding nearby friends are currently represented as design concepts only. Therefore, this evaluation cannot establish their technical feasibility or performance.

2. **The revised task assignment approach has not yet been validated with users.**  
   The decision to automatically provide an initial task division and allow users to swap tasks is a design decision based on the current project direction. Further user testing is required to determine whether users actually prefer this approach over claiming tasks themselves.

3. **The proposed "Find Friends" map requires further investigation.**  
   A map showing nearby users is currently just  a proposed solution. Further testing is required to determine whether a map is the most appropriate way for users to find cooking partners. The design would also need to consider privacy and whether users are comfortable with their location or proximity being visible to others.

4. **The feedback does not yet provide evidence of long-term use.**  
   The current evaluation focuses on understanding and refining the prototype. It does not establish whether the proposed features would change how frequently students cook together or how they behave during real collaborative cooking sessions.

5. **The evaluation does not yet test the complete cooking experience.**  
   The prototype currently represents individual parts of the proposed workflow. Further evaluation is required to assess how these interactions work together from finding participants and joining a cooking session through to completing the meal.

These limitations should be considered when interpreting the findings.

---

## 8. Next Steps

Based on the evaluation, the next iteration will focus on:

1. Find Friends Menu
2. Rename App Feature
3. User Accounts and Friend List System
4. Cooking Lobby Redesign

The prototype will continue to be refined through the design process based on user feedback and evaluation findings.
