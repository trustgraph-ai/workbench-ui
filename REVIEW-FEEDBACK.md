# User Feedback Review

Collected from internal team discussion about Workbench usability.

## Summary

**Universal feedback:** Users are confused by flows and flow classes. Even experienced developers (20+ years) find it overwhelming.

## Specific Feedback

### Flows & Flow Classes

- "Oh yeah flows, that's still really confusing"
- "Flow classes are still REALLY confusing"
- "The flow classes aren't clear what they are"
- "When you create a flow, you get a drop down of stuff that is going to be very confusing to people"
- "People are consumed by flow classes. Confused."
- "I look at all the flow options yesterday, and even I find it overwhelming and have questions"

### Can't Edit Flows

- "Can you not edit the default flow?"
- "Haven't done flow editing, you can delete it and create it again"

### Too Many Options

- "It's too many patterns, too many options, just too much"
- "Do we really need all those patterns as options?"
- "Why do there need to be so many options for patterns for flows?"

### Terminology

- "That's confusing. People will not understand that."
- "The only way - at the moment - I can think of is to say there are flow 'templates'"
- Descriptions "describe what they do, not what they combine"

### Mental Model Gap

- "How do you specify things? Is there a prompt flow?"
- "Do we have guides on how you would 'chain' flows together?"
- "What if I wanted to combine that with other abilities?"
- "Like, when I created a flow, there was only one ontology option"

### Missing Options

- "I didn't see the ability to specify output tokens when creating a new flow or choose the chunking method"

### Cross-Page Dependencies

- "If you create a new flow, you have to specify that on the other pages. Collections too."
- "It's a lot to remember and a lot to know"

### Overall Overwhelm

- "The flow process is going to totally overwhelm people"
- "How it is presented in the Workbench is overwhelming"
- "There's a LOT in the Workbench now. A LOT a lot."
- "Overwhelmed is not how we want new users to feel. That's a sure path to them giving up on it."

### Ontology Editor

- "I'm not even mentioning the ontology editor because that made my eyes bulge out of my head"

## Guided Tutorial / Test Drive

### The Core Problem

> "We want people to see the value of TG and what it does without having to understand all the details of how to do it."

### Video Game Analogy

> "Video games almost always have an in-game tutorial that steps you through how you use everything. Where you're not in control. You're just being guided through everything."

### Proposed Solution

> "Could we overlap a step by step tutorial on top of the Workbench that plays out guides and user patterns? You can select a guide, and the Workbench will go into a mode that shows you exactly what buttons to press in what sequence and what to select."

### Features Discussed

- Select a guide/scenario to walk through
- Overlay shows exactly what to click and in what order
- Users can choose to see explanations ("behind the scenes")
- Users can exit the walkthrough at any time
- Similar to browser automation tools / guided tour tech
- Libraries mentioned: intro.js, usertour (AGPL licensed)
- Could be a commercial feature with automated training

### Goal

> "How to get value out of TrustGraph. That's the goal."

- A canned demo
- "Here's a doc, here's an ontology, how do you get to being able to see it in the graph viewer, build an agent flow, and make it do stuff"
- "People will be asking, 'why would I learn to use TG? What can it do for me?' Step by step show them."
- "So they don't have to read a guide. Guarantee their success."
- "No struggling to make things work, make sure it will work."

### Demo Content Strategy

**Not** teaching how to use the Workbench UI - teaching what TrustGraph can do.

**Use simple, verifiable examples:**
> "And not intelligence reports. Something they can understand, even if it's something as stupid as when was a song performed, which is similar to asking which products did customer X buy and at which location?"

**Show where ChatGPT fails:**
> "It should be something they can verify. That you could put the same question into ChatGPT and it will give bs. Like how no AI could count that number of times Metallica played songs correctly."

**The "aha moment":**
> "Which begins to show people 'why their agents are failing', so they'll have that 'oooo, agents need all this context underneath them, and TG will build it, manage it, and deploy it for me!'"

---

## Key Insights From Discussion

### Structure vs Presentation

> "There's two things to consider here. How it structurally works. How it is presented to people in the Workbench. How it is presented in the Workbench is overwhelming."

### Naming & Organization Matters

> "This is about how you name things, group them, sequence them. Makes all the difference."

### Proposed Mental Model

> "What are the patterns? To me, there's vector only and then there's Graph. Then, it's a matter of add-ons. Do you want structured data support? Ontology support?"

### Not About Removing Features

> "That's not what I'm saying. I'm talking about UX. This is totally about how the capability is packaged for the user. And presented."

### Workbench Purpose

- "What do we want the Workbench to be?"
- "If we want it to be simple and easy, it's not"
- "If we want it to be a way to test everything, then it is"
- Purpose: "marketing -> learn -> get experience"
- "Then I think it's not serving that purpose well"
