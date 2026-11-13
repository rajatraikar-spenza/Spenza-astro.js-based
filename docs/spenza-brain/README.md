# Spenza brain (internal knowledge for the AI blog pipeline)

Drop markdown notes here (product facts, messaging, ICP, pricing logic, approved claims, competitor
positioning). The AI pipeline ranks them against each brief by keyword overlap and gives the best
excerpts to the researcher and the writer.

- One topic per file; headings split a file into chunks, so use `#`, `##`, `###` generously.
- Write facts the way you want them stated in public. Anything here is treated as trusted, so keep
  unapproved claims out.
- This folder ships in the repository: do not put customer data or secrets in it.

To connect a live knowledge base instead (or as well), set the repository secrets `SPENZA_BRAIN_URL`
and `SPENZA_BRAIN_TOKEN`. The endpoint receives `POST {"query": "...", "topK": 6}` and answers
`{"results": [{"title": "...", "text": "...", "url": "optional"}]}`.
