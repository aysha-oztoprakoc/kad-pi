# Issuer/subject policy map

Canonical issuer observed in the repository: `actor.project_lead`. V2 validates that issuer against an explicit grant map and rejects forbidden operations. The authorized subject is a distinct canonical actor/role string and must equal the requesting executor. Root/UID is not consulted as KAD authority.
