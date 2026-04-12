---
description: Learn how AIDP enables content owners to control how AI represents their brand information, solving the problem of AI misquoting and fabricating facts
---

# What is AIDP

## The Problem: AI Is Speaking for You, and You Have No Control

AI agents like ChatGPT, Claude, and Gemini are answering millions of questions about businesses, organizations, and individuals every day. But their answers are often wrong: misspelled names, outdated information, fabricated claims, and even confusion with competitors.

As a content owner, you have no control over this. There is no way to tell AI "that name is wrong," "we no longer offer this service," or "please don't refer to us by that name."

This is the problem AIDP solves.

## What AIDP Does

AIDP (AI Directive Protocol) is an open standard protocol that enables content owners to publish structured information specifically designed for AI agents to read, along with "directives" that control how AI presents that information.

In simple terms: you don't just provide data to AI -- you also tell AI how to use that data.

## An Analogy

Schema.org tells search engines "what your content is." AIDP tells AI agents three things:

- What your content is
- How to talk about your content
- How trustworthy that content is

## Core Capabilities

- **First-party fact control** -- Use `must_include` and `must_not_say` directives to explicitly define what AI must mention and what it must never say
- **Identity protection** -- Use `preferred_name` and `never_call` directives to ensure AI refers to you by the correct name
- **Verifiable trust** -- DNS verification, business registration verification, multi-dimensional trust scores -- trust is verified, not self-claimed
- **Multi-format output** -- A single AIDP source automatically generates AIDP JSON, Schema.org, llms.txt, and Open Graph
- **AI agent friendly** -- Supports multiple transport methods including MCP, REST API, and static files
- **Content integrity** -- Community correction mechanism where third parties can dispute inaccurate information, preventing errors from persisting
- **AI exposure tracking** -- Track which AI agents use your content, how often, and which content is most popular

## Who Is It For

AIDP is designed for anyone who wants to control how their information is presented in the AI era:

- Businesses and brands
- Nonprofit organizations
- Government agencies
- Media and publishing organizations
- Academic institutions
- Individuals and public figures

## What is SpeakSpec

SpeakSpec is the first platform to implement the AIDP protocol. It provides a dashboard where you can manage entity data, publish content, configure directives, and track AI exposure -- all without writing any code.

Visit [speakspec.com](https://speakspec.com) to learn more.

## Next Steps

- [Getting Started](/en/guide/getting-started) -- Publish your first AIDP data in five minutes
- [Protocol Specification Overview](/en/spec/overview) -- Dive into the complete technical specification of the AIDP protocol
