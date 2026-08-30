---
kad_id: kad-878a0c3a2facdd17496195ff
title: Review: CATALOG.json
type: review_record
authority: PROPOSAL_UNREVIEWED
epistemic_class: UNKNOWN
review_status: PENDING
visibility: project
context_eligible: false
train_eligible: false
publish: false
temporal_status: HISTORICAL
legacy_source: wiki/research/CATALOG.json
---

{
  "schema_version": "kad-research-corpus-v1",
  "updated_at": "2026-08-30T01:58:39.487Z",
  "trust_domain": "engineering",
  "document_count": 5,
  "documents": [
    {
      "document_id": "doc:doi:10.48550/arxiv.2210.03629",
      "title": "ReAct: Synergizing Reasoning and Acting in Language Models",
      "authors": [
        "Shunyu Yao",
        "Jeffrey Zhao",
        "Dian Yu",
        "Nan Du",
        "Izhak Shafran",
        "Karthik Narasimhan",
        "Yuan Cao"
      ],
      "year": 2023,
      "abstract": "While large language models (LLMs) have demonstrated impressive performance across diverse NLP tasks, their capabilities for multi-step reasoning and environment grounding remain distinct challenges. We present ReAct, a paradigm that synergizes reasoning and acting in language models by prompting them to generate interleaved reasoning traces and task-specific actions.",
      "identifiers": [
        {
          "type": "doi",
          "value": "10.48550/arxiv.2210.03629",
          "raw_value": "10.48550/arxiv.2210.03629",
          "provenance": null
        },
        {
          "type": "arxiv",
          "value": "2210.03629",
          "raw_value": "2210.03629",
          "provenance": null
        }
      ],
      "primary_identifier": {
        "type": "doi",
        "value": "10.48550/arxiv.2210.03629",
        "raw_value": "10.48550/arxiv.2210.03629",
        "provenance": null
      },
      "sources": [
        {
          "source_id": "src:hash:ec5216b74c23182e3c9899d1e84582954b5f115d93d9b7982b424c42cbff17dc",
          "kind": "local_file",
          "source_path": "corpus/research/react-iclr2023.txt",
          "source_ref": "corpus/research/react-iclr2023.txt",
          "source_hash": "ec5216b74c23182e3c9899d1e84582954b5f115d93d9b7982b424c42cbff17dc",
          "byte_size": 2100,
          "mime_type": "text/plain",
          "acquired_at": "2026-08-30T01:58:30.325Z",
          "provenance": {
            "method": "manifest",
            "ingestion_method": "manifest",
            "origin": "curated_real_corpus",
            "origin_record_id": null,
            "observed_at": "2026-08-30T01:58:30.325Z",
            "actor": "operator",
            "evidence_ref": null,
            "server_id": null,
            "api_version": null
          },
          "epistemic_class": "DOCUMENT_DERIVED",
          "acceptance_state": "PROPOSED",
          "trust_domain": "engineering"
        }
      ],
      "provenance": {
        "method": "manifest",
        "ingestion_method": "manifest",
        "origin": "curated_real_corpus",
        "origin_record_id": null,
        "observed_at": "2026-08-30T01:58:30.324Z",
        "actor": "operator",
        "evidence_ref": null,
        "server_id": null,
        "api_version": null
      },
      "epistemic_class": "DOCUMENT_DERIVED",
      "authority_class": "CANONICAL_RESEARCH",
      "acceptance_state": "ACCEPTED",
      "trust_domain": "engineering",
      "created_at": "2026-08-30T01:58:30.324Z",
      "updated_at": "2026-08-30T01:58:39.487Z",
      "version": 1
    },
    {
      "document_id": "doc:doi:10.48550/arxiv.2310.06770",
      "title": "SWE-bench: Can Language Models Resolve Real-World GitHub Issues?",
      "authors": [
        "Carlos E. Jimenez",
        "John Yang",
        "Alexander Wettig",
        "Shunyu Yao",
        "Kexin Pei",
        "Ofir Press",
        "Karthik Narasimhan"
      ],
      "year": 2024,
      "abstract": "We introduce SWE-bench, an evaluation framework consisting of 2,294 software engineering problems drawn from real GitHub issues and pull requests across 12 popular Python repositories. SWE-bench evaluates whether an agent can generate a code patch that successfully passes existing tests plus newly introduced fail-to-pass unit tests.",
      "identifiers": [
        {
          "type": "doi",
          "value": "10.48550/arxiv.2310.06770",
          "raw_value": "10.48550/arxiv.2310.06770",
          "provenance": null
        },
        {
          "type": "arxiv",
          "value": "2310.06770",
          "raw_value": "2310.06770",
          "provenance": null
        }
      ],
      "primary_identifier": {
        "type": "doi",
        "value": "10.48550/arxiv.2310.06770",
        "raw_value": "10.48550/arxiv.2310.06770",
        "provenance": null
      },
      "sources": [
        {
          "source_id": "src:hash:7014cded3f4b165bca4b525f6df5ae5eb6730251248e505b802a2067cd0b542c",
          "kind": "local_file",
          "source_path": "corpus/research/swe-bench-iclr2024.txt",
          "source_ref": "corpus/research/swe-bench-iclr2024.txt",
          "source_hash": "7014cded3f4b165bca4b525f6df5ae5eb6730251248e505b802a2067cd0b542c",
          "byte_size": 1671,
          "mime_type": "text/plain",
          "acquired_at": "2026-08-30T01:58:30.368Z",
          "provenance": {
            "method": "manifest",
            "ingestion_method": "manifest",
            "origin": "curated_real_corpus",
            "origin_record_id": null,
            "observed_at": "2026-08-30T01:58:30.368Z",
            "actor": "operator",
            "evidence_ref": null,
            "server_id": null,
            "api_version": null
          },
          "epistemic_class": "DOCUMENT_DERIVED",
          "acceptance_state": "PROPOSED",
          "trust_domain": "engineering"
        }
      ],
      "provenance": {
        "method": "manifest",
        "ingestion_method": "manifest",
        "origin": "curated_real_corpus",
        "origin_record_id": null,
        "observed_at": "2026-08-30T01:58:30.367Z",
        "actor": "operator",
        "evidence_ref": null,
        "server_id": null,
        "api_version": null
      },
      "epistemic_class": "DOCUMENT_DERIVED",
      "authority_class": "CANONICAL_RESEARCH",
      "acceptance_state": "ACCEPTED",
      "trust_domain": "engineering",
      "created_at": "2026-08-30T01:58:30.368Z",
      "updated_at": "2026-08-30T01:58:30.368Z",
      "version": 1
    },
    {
      "document_id": "doc:doi:10.48550/arxiv.2302.04761",
      "title": "Toolformer: Language Models Can Teach Themselves to Use Tools",
      "authors": [
        "Timo Schick",
        "Jane Dwivedi-Yu",
        "Roberto Dessì",
        "Roberta Raileanu",
        "Maria Lomeli",
        "Luke Zettlemoyer",
        "Nicola Cancedda",
        "Thomas Scialom"
      ],
      "year": 2023,
      "abstract": "We introduce Toolformer, a model trained to decide which tools to call, when to call them, what arguments to pass, and how to best incorporate the results into future token prediction. This is achieved in a self-supervised manner without requiring massive human annotation by filtering API calls based on whether execution reduces perplexity.",
      "identifiers": [
        {
          "type": "doi",
          "value": "10.48550/arxiv.2302.04761",
          "raw_value": "10.48550/arxiv.2302.04761",
          "provenance": null
        },
        {
          "type": "arxiv",
          "value": "2302.04761",
          "raw_value": "2302.04761",
          "provenance": null
        }
      ],
      "primary_identifier": {
        "type": "doi",
        "value": "10.48550/arxiv.2302.04761",
        "raw_value": "10.48550/arxiv.2302.04761",
        "provenance": null
      },
      "sources": [
        {
          "source_id": "src:hash:092036dc592088a056cad8f5d36d603dbf9969035d65a07cef91dcfc44dd39db",
          "kind": "local_file",
          "source_path": "corpus/research/toolformer-neurips2023.txt",
          "source_ref": "corpus/research/toolformer-neurips2023.txt",
          "source_hash": "092036dc592088a056cad8f5d36d603dbf9969035d65a07cef91dcfc44dd39db",
          "byte_size": 1866,
          "mime_type": "text/plain",
          "acquired_at": "2026-08-30T01:58:30.413Z",
          "provenance": {
            "method": "manifest",
            "ingestion_method": "manifest",
            "origin": "curated_real_corpus",
            "origin_record_id": null,
            "observed_at": "2026-08-30T01:58:30.413Z",
            "actor": "operator",
            "evidence_ref": null,
            "server_id": null,
            "api_version": null
          },
          "epistemic_class": "DOCUMENT_DERIVED",
          "acceptance_state": "PROPOSED",
          "trust_domain": "engineering"
        }
      ],
      "provenance": {
        "method": "manifest",
        "ingestion_method": "manifest",
        "origin": "curated_real_corpus",
        "origin_record_id": null,
        "observed_at": "2026-08-30T01:58:30.412Z",
        "actor": "operator",
        "evidence_ref": null,
        "server_id": null,
        "api_version": null
      },
      "epistemic_class": "DOCUMENT_DERIVED",
      "authority_class": "CANONICAL_RESEARCH",
      "acceptance_state": "ACCEPTED",
      "trust_domain": "engineering",
      "created_at": "2026-08-30T01:58:30.412Z",
      "updated_at": "2026-08-30T01:58:30.413Z",
      "version": 1
    },
    {
      "document_id": "doc:doi:10.48550/arxiv.2303.11366",
      "title": "Reflexion: Language Agents with Verbal Reinforcement Learning",
      "authors": [
        "Noah Shinn",
        "Federico Cassano",
        "Edward Berman",
        "Ashwin Gopinath",
        "Karthik Narasimhan",
        "Shunyu Yao"
      ],
      "year": 2023,
      "abstract": "We introduce Reflexion, an architecture that endows LLM agents with dynamic verbal reinforcement learning without weight updates. Reflexion agents reflect upon task-feedback signals by generating linguistic self-reflections that are stored in an episodic memory buffer and injected into future trials.",
      "identifiers": [
        {
          "type": "doi",
          "value": "10.48550/arxiv.2303.11366",
          "raw_value": "10.48550/arxiv.2303.11366",
          "provenance": null
        },
        {
          "type": "arxiv",
          "value": "2303.11366",
          "raw_value": "2303.11366",
          "provenance": null
        }
      ],
      "primary_identifier": {
        "type": "doi",
        "value": "10.48550/arxiv.2303.11366",
        "raw_value": "10.48550/arxiv.2303.11366",
        "provenance": null
      },
      "sources": [
        {
          "source_id": "src:hash:9dd6a6550dd6d5a72205217eb7cf08849c7c8da56b2dd53ba5f56176577643ca",
          "kind": "local_file",
          "source_path": "corpus/research/reflexion-neurips2023.txt",
          "source_ref": "corpus/research/reflexion-neurips2023.txt",
          "source_hash": "9dd6a6550dd6d5a72205217eb7cf08849c7c8da56b2dd53ba5f56176577643ca",
          "byte_size": 1858,
          "mime_type": "text/plain",
          "acquired_at": "2026-08-30T01:58:30.458Z",
          "provenance": {
            "method": "manifest",
            "ingestion_method": "manifest",
            "origin": "curated_real_corpus",
            "origin_record_id": null,
            "observed_at": "2026-08-30T01:58:30.458Z",
            "actor": "operator",
            "evidence_ref": null,
            "server_id": null,
            "api_version": null
          },
          "epistemic_class": "DOCUMENT_DERIVED",
          "acceptance_state": "PROPOSED",
          "trust_domain": "engineering"
        }
      ],
      "provenance": {
        "method": "manifest",
        "ingestion_method": "manifest",
        "origin": "curated_real_corpus",
        "origin_record_id": null,
        "observed_at": "2026-08-30T01:58:30.457Z",
        "actor": "operator",
        "evidence_ref": null,
        "server_id": null,
        "api_version": null
      },
      "epistemic_class": "DOCUMENT_DERIVED",
      "authority_class": "CANONICAL_RESEARCH",
      "acceptance_state": "ACCEPTED",
      "trust_domain": "engineering",
      "created_at": "2026-08-30T01:58:30.457Z",
      "updated_at": "2026-08-30T01:58:30.458Z",
      "version": 1
    },
    {
      "document_id": "doc:doi:10.48550/arxiv.2303.17651",
      "title": "Self-Refine: Iterative Refinement with Self-Feedback",
      "authors": [
        "Aman Madaan",
        "Niket Tandon",
        "Prakhar Gupta",
        "Skyler Hallinan",
        "Luyu Gao",
        "Sarah Wiegreffe",
        "Uri Alon",
        "Nouha Dziri",
        "Shrimai Prabhumoye",
        "Yiming Yang",
        "Shashank Gupta",
        "Bodhisattwa Prasad Majumder",
        "Katherine Hermann",
        "Sean Welleck",
        "Amir Yazdanbakhsh",
        "Peter Clark"
      ],
      "year": 2023,
      "abstract": "We introduce Self-Refine, an iterative refinement approach where a single LLM acts as the generator, critic, and refiner. The model produces an initial output, generates actionable feedback evaluating its own output along specific task dimensions, and refines the output using this self-generated feedback.",
      "identifiers": [
        {
          "type": "doi",
          "value": "10.48550/arxiv.2303.17651",
          "raw_value": "10.48550/arxiv.2303.17651",
          "provenance": null
        },
        {
          "type": "arxiv",
          "value": "2303.17651",
          "raw_value": "2303.17651",
          "provenance": null
        }
      ],
      "primary_identifier": {
        "type": "doi",
        "value": "10.48550/arxiv.2303.17651",
        "raw_value": "10.48550/arxiv.2303.17651",
        "provenance": null
      },
      "sources": [
        {
          "source_id": "src:hash:da4c142b68a7da1ed45ccd5064a2bf547b8ae8624c609c9177a2f3c3ba08eae6",
          "kind": "local_file",
          "source_path": "corpus/research/self-refine-neurips2023.txt",
          "source_ref": "corpus/research/self-refine-neurips2023.txt",
          "source_hash": "da4c142b68a7da1ed45ccd5064a2bf547b8ae8624c609c9177a2f3c3ba08eae6",
          "byte_size": 1627,
          "mime_type": "text/plain",
          "acquired_at": "2026-08-30T01:58:30.504Z",
          "provenance": {
            "method": "manifest",
            "ingestion_method": "manifest",
            "origin": "curated_real_corpus",
            "origin_record_id": null,
            "observed_at": "2026-08-30T01:58:30.504Z",
            "actor": "operator",
            "evidence_ref": null,
            "server_id": null,
            "api_version": null
          },
          "epistemic_class": "DOCUMENT_DERIVED",
          "acceptance_state": "PROPOSED",
          "trust_domain": "engineering"
        }
      ],
      "provenance": {
        "method": "manifest",
        "ingestion_method": "manifest",
        "origin": "curated_real_corpus",
        "origin_record_id": null,
        "observed_at": "2026-08-30T01:58:30.503Z",
        "actor": "operator",
        "evidence_ref": null,
        "server_id": null,
        "api_version": null
      },
      "epistemic_class": "DOCUMENT_DERIVED",
      "authority_class": "CANONICAL_RESEARCH",
      "acceptance_state": "ACCEPTED",
      "trust_domain": "engineering",
      "created_at": "2026-08-30T01:58:30.503Z",
      "updated_at": "2026-08-30T01:58:30.504Z",
      "version": 1
    }
  ]
}