```markdown
# Prototype Evaluation

## 1. Overview

This document records the evaluation of our prototype as part of the iterative design process.

The purpose of the evaluation was to investigate how the prototype supports the social and mobile aspects of collaborative cooking identified through our research and experience requirement studies.

The evaluation focuses on how KTCHN could support social interaction, collaboration, shared awareness, and coordination between participants during meal preparation, as well as how mobile interactions could support these activities within a shared kitchen environment.

---

## 2. Evaluation Objectives

The evaluation aims to investigate:

- Whether the proposed shared cooking session supports social participation and interaction between users.
- Whether task allocation supports collaboration and shared responsibility during cooking.
- Whether shared progress helps participants remain aware of one another's activities.
- Whether the proposed interactions encourage participants to coordinate their work rather than cook independently.
- Whether features such as helping other participants support collaboration within the group.
- Whether hands-free interaction could support mobile use while participants are engaged in cooking activities.
- Whether the proposed kitchen-scanning concept connects the digital experience with the physical kitchen environment.
- Whether speculative features such as finding nearby friends and social media feed features could support the formation of a shared cooking session.
- Whether personalisation could make interactions with the cooking assistant more natural within the shared activity.
- What changes should be made to the prototype to better support social interaction and mobile collaboration.

---

## 3. Prototype Version

### **1. Prototype:** Low Fidelity / version 1.0

**Date evaluated:** [15 September 2026]

**Prototype link:** [Link](docs/design/table%2018%20low%20fi%20prototype.pdf)

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
- Upload Picture and Social Media Feed

These components were simulated because they were not central to the interactions being evaluated.

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
- Post Dish

---

## 4. Evaluation Method

### 4.1 Participant(s)

**Number of participants:** 5

**Participant type:** Target Users / Developers

**Recruitment:** The initial evaluation of both prototypes was conducted internally within the team and cross-referenced while analysing existing user interviews and research literature.

> Participant identities are anonymised in this documentation.

---

### 4.2 Evaluation Approach

We used an informal semi-structured feedback approach to evaluate the prototypes. As the prototypes consisted of low-fidelity OneNote sketches and high-fidelity Figma wireframes, the evaluation focused on gathering people's opinions and initial reactions to the proposed social and mobile interactions rather than measuring usability or task performance.

Participants were shown a scenario representing a typical collaborative cooking situation:

> "You and several friends who live together want to cook a meal together. You have decided what you want to cook and are about to start preparing the meal in a shared kitchen. The app is intended to help you organise the cooking session, divide the cooking tasks, follow your individual instructions, see the group's progress, and help other participants when you finish your own task."

Participants were then walked through the relevant screens and feature concepts in the prototype and asked for their opinions on how the proposed interactions could support collaboration, social participation, and coordination during cooking. Feedback was gathered on specific concepts such as task assignment and swapping, the cooking lobby, meal preferences, shared cooking progress, hands-free interaction, helping other participants, and the proposed kitchen-scanning concept.

### 4.3 Evaluation Questions

The evaluation investigated the following questions:

1. Does joining a shared cooking session provide a clear way for participants to come together for a collaborative activity?
2. Does the cooking lobby support the social organisation of a group before cooking begins?
3. Could meal preferences support collaborative decision-making when selecting a meal for the group?
4. Does dividing a meal into individual cooking tasks support shared responsibility between participants?
5. Does the proposed task allocation approach balance system guidance with participants' ability to make their own decisions?
6. Would allowing participants to swap cooking tasks support collaboration and accommodate individual preferences?
7. Could hands-free interaction support mobile use while participants are actively cooking?
8. Does the option to help another participant encourage cooperation after completing an individual task?
9. Does the shared group progress view support awareness of other participants' activities?
10. Does showing the status of other participants help coordinate interdependent cooking activities?
11. Does the proposed experience support collaboration between participants rather than making each person feel like they are cooking independently?
12. Could the proposed kitchen-scanning concept connect the digital cooking experience with the physical shared kitchen?
13. Could a "Find Friends" interaction help users connect with other participants who are available to cook together?
14. Could personalised voice commands make interactions with the cooking assistant more suitable for a shared cooking environment?
15. What changes should be made to the prototype to better support social interaction and mobile collaboration?

---

## 5. Observations and Results

#### Finding 1: No "Claim Task" Option

**Observation:** Since user interviews indicate that task division is inconsistent while cooking collaboratively, the app should provide a baseline division of tasks with an option to **swap** tasks if needed. This could reduce the need for participants to negotiate every task individually while still allowing them to coordinate and make adjustments together.

**Implication:**

The app should initially divide tasks automatically instead of having a "CLAIM" button. If users wish to change their tasks, they can swap them between themselves. This approach is intended to support shared responsibility while allowing participants to negotiate the distribution of work.

---

#### Finding 2: Changes to Personalised Voice Commands

**Observation:** Instead of having the app train itself to recognise the specific user's voice, which would be a technical endeavour likely beyond the scope of the project, the team decided to give users the option to "name" their app and thus give unique voice commands accordingly. This is a more plausible approach to implement within the current project scope and explores how personalisation could make the mobile cooking interaction more natural.

**Implication:**

Personalised voice commands as a feature will now be replaced by the ability to rename the app for each user and have the app recognise voice commands directed at said name. This design aims to support hands-free interaction while users are engaged in cooking activities.

---

#### Finding 3: Find Friends View

**Observation:** The team identified the need to implement a "Find Friends" menu to make it easy for users to find each other when they are gathered in the kitchen and ready to cook. This interaction would support the social aspect of KTCHN by helping participants connect before entering a shared cooking session.

**Implication:**

The team is now considering implementing the "Find Friends" menu as a map interface that highlights other online users in the vicinity. This would be the menu right before the cooking lobby and is intended to support the process of forming a group for collaborative cooking.

---

## 6. Analysis

The evaluation findings were analysed against the social and mobile experience requirements identified from our earlier research.

### Key insights

Based on the evaluation, we identified the following key insights:

1. **Task assignment should provide an initial structure while supporting collaboration.**

   The prototype should provide users with an initial division of cooking tasks rather than requiring participants to manually claim tasks. However, users should still be able to swap tasks between themselves when necessary. This approach is intended to reduce uncertainty around individual responsibilities while allowing participants to coordinate and adapt the division of work to their preferences and circumstances.

2. **Personalisation should support mobile interaction within the project scope.**

   The original concept of training the system to recognise each user's individual voice was identified as technically ambitious for the current project scope. The design was therefore revised to explore a simpler form of personalisation, where users can give their cooking assistant a custom name and use that name when issuing commands. This explores how hands-free interaction could support cooking activities without requiring users to repeatedly interact with their devices manually.

3. **Joining a cooking session requires a clear social interaction before the lobby.**

   The current prototype assumes that users can join a cooking group, but the process of finding and connecting with other participants was not sufficiently defined. This led to the proposed addition of a "Find Friends" interaction before the cooking lobby. This interaction is intended to make it easier for users to connect with others and begin a shared cooking activity.

4. **The physical context of the kitchen remains an important part of the mobile experience.**

   The proposed kitchen-scanning interaction connects the digital cooking experience with the physical environment in which the cooking takes place. However, the interaction needs to remain focused on supporting coordination and awareness within the shared kitchen rather than making computer vision the central purpose of the application.

5. **The prototype is moving towards a balance between shared coordination and user control.**

   The proposed changes suggest that the system should handle repetitive organisational work, such as providing an initial task division, while allowing participants to make their own adjustments when necessary. This approach aims to support collaboration without removing participants' control over how they contribute to the shared cooking activity.

---

## 7. Limitations

The evaluation had the following limitations:

1. **Several proposed social and mobile interactions have not yet been technically implemented.**

   Features such as task assignment, voice interaction, kitchen scanning, and finding nearby friends are currently represented as design concepts only. Therefore, this evaluation cannot establish their technical feasibility or performance in a real shared cooking environment.

2. **The revised task assignment approach has not yet been validated with users.**

   The decision to automatically provide an initial task division and allow users to swap tasks is a design decision based on the current project direction. Further evaluation is required to determine whether users find this approach appropriate for supporting shared responsibility and collaboration.

3. **The proposed "Find Friends" map requires further investigation.**

   A map showing nearby users is currently just a proposed solution. Further evaluation is required to determine whether a map is the most appropriate way for users to find cooking partners and initiate a shared cooking activity. The design would also need to consider privacy and whether users are comfortable with their location or proximity being visible to others.

4. **The feedback does not yet provide evidence of long-term social engagement.**

   The current evaluation focuses on exploring and refining the proposed social and mobile interactions. It does not establish whether the features would change how frequently students cook together, strengthen social connections, or influence behaviour during real collaborative cooking sessions.

5. **The evaluation does not yet examine the complete collaborative cooking experience.**

   The prototype currently represents individual parts of the proposed workflow. Further evaluation is required to assess how these interactions work together, from finding participants and joining a cooking session through to coordinating tasks and completing the meal.

These limitations should be considered when interpreting the findings.

---

## 8. Next Steps

Based on the evaluation, the next iteration will focus on:

1. Find Friends Menu
2. Rename App Feature
3. User Accounts and Friend List System
4. Cooking Lobby Redesign

The prototype will continue to be refined through the design process based on user feedback and evaluation findings, with a focus on supporting social interaction, shared awareness, and mobile coordination during collaborative cooking.
```
---

## 9. Tradeshow Evaluation and Feedback

### 9.1 Evaluation Context

Following the earlier prototype evaluation, Team 18 received peer feedback on KTCHN during the tradeshow. Feedback was recorded in Team 18’s inbox on the [DECO3500 Tradeshow Feedback Miro board](https://miro.com/app/board/uXjVEYroT98=/?share_link_id=633908794100).

Responses were provided by Teams 10, 11, 12, 13, 16 and 17 across six categories: social and contextual experience; pitch, poster and ethics; functionality and simulation; domain and challenging scenarios; research and evaluation informing design; and value and future development. Some categories were left blank, and some responses combined comments from several reviewers. These responses are therefore treated as qualitative peer feedback rather than a participant count or a quantitative measure of usability.

The findings below concern the tradeshow presentation and prototype. They supplement the earlier evaluation and do not demonstrate performance during a complete real-world cooking session.

### 9.2 Findings and Design Implications

#### Finding 1: Shared task coordination was a clear strength

Reviewers recognised the value of making responsibilities and group progress visible. Teams 10, 11, 12, 13 and 17 highlighted task sharing, swapping, progress tracking or helping others as useful aspects of the concept. This supports the project’s focus on coordinating collaborative cooking.

**Design implication:** Prioritise the shared task workflow. Further evaluation should investigate whether it reduces uncertainty and helps distribute work fairly when participants have different cooking skills.

#### Finding 2: Coordination did not always translate into a convincing social experience

Although reviewers understood the organisational benefits, some questioned how the app encouraged meaningful interaction. Team 10 suggested retaining recipe notes or shared memories between sessions. Team 12 felt the social feed was disconnected from the core concept. Team 13 wanted clearer social interaction beyond operating the app.

Team 16 questioned the need for an app when cooks are already together and proposed remote cooking with video calls.

**Design implication:** Test whether KTCHN supports face-to-face communication, mutual assistance and participation in the same kitchen. Remote cooking is a possible alternative direction requiring separate research. Features such as a social feed or session history should be retained only where their contribution to the intended experience is clear.

#### Finding 3: Working and simulated features needed clearer explanation

Teams 10, 11 and 12 wanted clearer demonstrations of synchronisation between devices and voice interaction. Team 12 also reported awkward operation on the demonstration tablet. Team 17 included a specific report that an attempted voice command to set a timer did not work.

These comments identify uncertainty and a reported interaction failure; they do not establish the implementation status of every feature.

**Design implication:** Clearly label functional, simulated and proposed features. Demonstrate two devices side by side so reviewers can see task changes propagate. Check the interface on the intended hardware and evaluate supported voice commands, error feedback and manual alternatives.

#### Finding 4: Cooking plans need to adapt to interruptions

Reviewers raised scenarios involving someone leaving mid-session, a phone losing power, a late arrival, a beginner needing additional guidance, or a task taking longer than expected. Teams 10 and 12 also highlighted competition for limited kitchen equipment. Team 17 warned that users might abandon the app when cooking becomes busy.

**Design implication:** Explore clear task handover and reassignment, visible connection status, adjustable timing and additional guidance for beginners. Evaluate whether these interactions remain quick enough to use during cooking.

#### Finding 5: Visibility and personal information introduce ethical concerns

Reviewers identified privacy concerns involving microphones, dietary information, budgets, photographs and individual progress. Teams 10 and 17 noted that visible task progress could make participants feel monitored or pressured. Teams 11, 12 and 13 raised concerns about allergy information, financial pressure and fair task allocation.

**Design implication:** Explore editable dietary information, control over sharing, clear microphone status and ways to pause listening. Task progress should support coordination without ranking participants or labelling slower cooks negatively. Any retained session history should be optional and considered alongside these privacy concerns.

#### Finding 6: Research connections were visible, but stronger evidence was needed

Teams 10 and 12 praised the research-to-design table. Other reviewers requested more specific links between participant feedback and design changes. Several teams recommended testing a full cooking session to investigate whether the proposed benefits occur in practice.

**Design implication:** Document each relevant research finding, the corresponding design response and the outcome of subsequent testing. Use existing, accurately recorded participant quotations and observations rather than illustrative quotations presented as evidence.

### 9.3 Interpretation and Limitations

The feedback suggests that KTCHN communicates a useful coordination concept, particularly through shared task visibility and flexible responsibilities. However, opinions differed on the strength of its social experience and its value compared with direct conversation.

The tradeshow provided reactions to the presentation and demonstration, rather than evidence of sustained use in a shared kitchen. Reviewers’ uncertainty about simulation also limits conclusions about technical performance. The feedback cannot establish that KTCHN improves fairness, reduces confusion or strengthens relationships during actual cooking.

### 9.4 Proposed Evaluation in a Real Kitchen

The next evaluation should involve students preparing a complete meal together in a shared kitchen, with each participant using their own device. This is a proposed study and has not been completed as part of the evaluation reported here.

Observation should follow the whole session: joining, selecting the meal, allocating tasks, preparing food, requesting help and completing the meal. The study should examine:

- Whether participants understand their responsibilities and task changes.
- Whether progress updates remain consistent across devices.
- Whether voice commands work amid ordinary kitchen noise.
- How participants manage delays, shared equipment and task handovers.
- Whether beginners can contribute without an experienced cook taking over.
- Whether the app encourages conversation and assistance or distracts from them.
- Whether visible progress feels supportive or creates pressure.

With participants’ consent, researchers could take observation notes and conduct short interviews afterwards. Participants should be able to decline recording and stop participation. A comparable session using their usual coordination methods would help assess what the app contributes.

### 9.5 Priorities Following the Tradeshow

Based on the feedback, the proposed priorities are to:

1. Evaluate a complete cooking session with multiple users and devices.
2. Verify synchronisation, supported voice commands and timer interactions.
3. Improve task reassignment and handling of delays or disconnections.
4. Investigate fairness, privacy and comfort with visible progress.
5. Clarify the purpose of secondary features, including the social feed.
6. Record how subsequent findings lead to specific design changes.

These priorities are recommendations arising from the tradeshow feedback, rather than completed improvements or validated outcomes.
