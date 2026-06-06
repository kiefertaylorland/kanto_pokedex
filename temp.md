# Temp Notes

## Table of Contents

- [How I Started]()
    - [The Initial Prompt](#the-initial-prompt)
    - [The Improved Prompt](#the-improved-prompt)
- [Creating a complete SDLC plan for the app](#creating-a-complete-sdlc-plan-for-the-app)

## How I Started

### The Initial Prompt

Using the [`Prompt Engineering`](https://chatgpt.com/g/g-bNiLAvz8R-prompt-engineeringA) custom GPT in ChatGPT, I was able to transform my initial prompt into from this:

``` markdown
Improve my prompt:

I want to create an app that is an emulator of the Pokédex containing the original 151 Pokémon. 

There should be a landing page screen with a CTA. 

There should be a signup/login page that allows user to sign up and login with Gmail SSO, GitHub SSO, and other major login providers. 

There should be a screen that allows a user to browse all 151 Pokémon.

There should be a screen that displays a selected  Pokémon’s details when a user selects a Pokémon from the Pokédex browser screen. 

There should be a screen that displays a map of the Kanto region from Pokémon red and blue and where each Pokémon in the Pokédex can be found. 

As I user I want to be able to create an account. 

As a user I want to be able to login and logout of my account. 

As a user I want to browse Pokémon in the Pokédex 

As a user I want to see Pokémon details and data when making a selection in the Pokédex. 

As a user I want to see a map of the Kanto region and where each Pokémon is located. 

We should be able to leverage the PokeAPI to gather data. 

I need assistance working through each phase of the SDLC.  

I need to create some artifacts as well:

PRD 
BRD
Tech Spec
Data Model

I would like to leverage supabase, cloudflare, and GitHub and any other recommendations you may have. 
```

### The Improved Prompt

``` markdown
You are a senior product strategist, solutions architect, and technical program manager. Help me plan and deliver a web app that emulates a Pokédex featuring the original 151 Pokémon from Generation I. Use the PokeAPI as the primary external data source where appropriate. Base your guidance on modern, practical product and engineering best practices. Take your time, think step by step, and check your work before responding.  

Objective

Create a complete SDLC plan for a Pokédex application with product, business, technical, and data deliverables. The app should be feasible for real-world implementation and should include clear recommendations for architecture, tooling, and phased execution.  

Product Scope

The application must include the following screens and capabilities:

Core Screens

1. Landing Page
    * A polished landing page that explains the product value.
    * Include a clear CTA such as “Get Started” or “Open Pokédex.”
2. Authentication Page
    * Support sign up, login, and logout.
    * Support major identity providers, including:
        * Gmail / Google SSO
        * GitHub SSO
        * Other major providers you recommend
    * Explain the tradeoffs of the recommended auth options.
3. Pokédex Browser Screen
    * Allow users to browse all original 151 Pokémon.
    * Include useful browsing features such as search, filter, sort, pagination or infinite scroll, and basic Pokémon cards.
4. Pokémon Detail Screen
    * When a user selects a Pokémon, show a detailed profile.
    * Include relevant data such as name, Pokédex number, types, stats, abilities, sprites/artwork, evolution information if available, and location data if appropriate.
5. Kanto Map Screen
    * Display a map of the Kanto region inspired by Pokémon Red and Blue.
    * Show where each Pokémon can be found.
    * If exact canonical location mapping is difficult or inconsistent through PokeAPI alone, explain how to handle this through a supplemental dataset, assumptions, or a custom mapping layer.

User Stories

Use and refine the following user stories:

* As a user, I want to create an account.
* As a user, I want to log in and log out of my account.
* As a user, I want to browse Pokémon in the Pokédex.
* As a user, I want to view Pokémon details and data after selecting a Pokémon.
* As a user, I want to see a map of the Kanto region and where each Pokémon is located.

Technology Preferences

I would like to leverage:

* Supabase
* Cloudflare
* GitHub

You may recommend additional technologies where helpful, but you must justify each recommendation in terms of:

* purpose
* benefits
* tradeoffs
* cost/complexity impact

What I Need From You

Guide me through each phase of the SDLC and produce the following artifacts:

1. BRD (Business Requirements Document)
2. PRD (Product Requirements Document)
3. Technical Specification
4. Data Model

Required Approach

Structure your response in phases and cover the full SDLC:

1. Discovery and problem framing
2. Requirements gathering
3. Product definition
4. Solution architecture
5. Data design
6. UX/UI planning
7. Implementation planning
8. Testing and QA strategy
9. Deployment and release strategy
10. Post-launch operations and future roadmap

Deliverables

Provide all output in the following structure:

1. Executive Summary

* Summarize the product concept, audience, value proposition, and recommended solution approach.

2. Assumptions and Open Questions

* List assumptions you are making.
* List open questions that should be answered before development begins.
*All assumptions and open questions MUST be answered before you generate any output artifacts or documents. 

3. SDLC Plan

For each SDLC phase, provide:

* goals
* key activities
* stakeholders
* deliverables
* risks
* recommended tools/services

4. BRD

Write a concise but realistic BRD that includes:

* business objective
* problem statement
* goals and success metrics
* stakeholders
* scope
* constraints
* risks
* business requirements

5. PRD

Write a detailed PRD that includes:

* product vision
* target users
* user journeys
* user stories
* functional requirements
* non-functional requirements
* MVP scope
* out-of-scope items
* acceptance criteria for each major feature

6. Technical Specification

Create a technical specification that includes:

* proposed system architecture
* frontend stack
* backend/services stack
* authentication approach
* database/storage approach
* API integration strategy with PokeAPI
* caching/performance strategy
* map/location strategy
* security considerations
* observability/monitoring
* CI/CD workflow using GitHub
* Cloudflare and Supabase responsibilities
* recommended folder or repo structure

7. Data Model

Create a logical data model with:

* entities
* attributes
* relationships
* which data should come from PokeAPI
* which data should be stored locally
* which data should be user-specific
* notes on sync, caching, and data freshness

8. Recommended Architecture Decisions

Provide a table with:

* decision
* recommendation
* rationale
* alternatives considered
* tradeoffs

9. Delivery Roadmap

Provide a phased roadmap:

* Phase 0: discovery and setup
* Phase 1: MVP
* Phase 2: enhanced experience
* Phase 3: scale and polish

For each phase include:

* key features
* technical milestones
* artifacts produced

10. Next Steps

End with a practical, prioritized action plan for what I should do first.

Output Requirements

* Be specific and actionable.
* Use clear headings.
* Use tables where useful.
* Avoid vague generic advice.
* When requirements are ambiguous, state assumptions explicitly.
* Highlight any areas where canonical Pokémon location data may need custom handling beyond PokeAPI.
* Make recommendations that are appropriate for a modern startup-style web app.
* Keep the response grounded in realistic implementation detail.
* Use the second person (“you”).
* Where useful, suggest alternative implementation options for MVP versus production-ready architecture.  

Optional Enhancement

Where appropriate, apply these prompt patterns:

* Persona Pattern for expert guidance
* Recipe Pattern for phased execution
* Template Pattern for structured artifact generation
* Alternative Approaches Pattern when comparing stack or architecture choices
* Reflection Pattern to validate recommendations and identify risks
```

---

## Creating a complete SDLC plan for the app

I then used the new and improved prompt to walk me through the Software Development Life Cycle to produce the following artifacts:

```markdown
- BRD
- PRD
- Technical Specification
- Data Model
```

The revised prompt requests the response be structured in the following phases:

```markdown
1. Discovery and problem framing 
2. Requirements gathering 
3. Product definition 
4. Solution architecture 
5. Data design 
6. UX/UI planning 
7. Implementation planning 
8. Testing and QA strategy 
9. Deployment and release strategy 
10. Post-launch operations and future roadmap
```

### ChatGPT's response

ChatGPT responded with the requested docs and output each phase into a separate markdown file which can be found in the `docs/` directory.