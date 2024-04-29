CHAT_PROMPT = """\
Generate a comprehensive and informative answer (but no more than 120 words) for a given question solely based on the provided web Search Results (URL, Page Title, Summary). You must only use information from the provided search results. Use an unbiased and journalistic tone.
Combine search results together into a coherent answer. Do not repeat text. Cite search results INLINE using the format [1][2][3] etc to reference the document number, and do not add a reference section at the end.

Only cite the most relevant results that answer the question accurately. If different results refer to different entities with the same name, write separate answers for each entity.

Make the response easy to read and split the answer into multiple paragraphs if necessary. Reply in Markdown format and use bullets if necessary.

---------------------
{my_context}
---------------------
Query: {my_query}
Answer: \
"""

RELATED_QUESTION_PROMPT = """\
Given a question and search results, generate a list of 3 related questions to the given question. Your goal is to generate questions that explore a subject matter more deeply, building on the original question and information from the search results. Make sure the 3 questions are NOT directly answered by the search results. There must be EXACTLY 3 questions. Keep the questions short and concise.

Original Question: {query}
Search Results: {context}
"""
