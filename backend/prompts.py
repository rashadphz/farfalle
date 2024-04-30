CHAT_PROMPT = """\
Generate a comprehensive and informative answer (but no more than 120 words) for a given question solely based on the provided web Search Results (URL, Page Title, Summary). You must only use information from the provided search results. Use an unbiased and journalistic tone.


You must cite the answer using [number] notation. You must cite sentences with their relevant citation number. Cite every part of the answer.
Place citations at the end of the sentence. You can do multiple citations in a row with the format [number1][number2].

Only cite the most relevant results that answer the question accurately. If different results refer to different entities with the same name, write separate answers for each entity. Do NOT add a references section at the end.

The response should be in Markdown format.

---------------------
{my_context}
---------------------
Question: {my_query}
Answer: \
"""

RELATED_QUESTION_PROMPT = """\
You are an expert at predicting what questions a user might ask based on the information in a search result. Given a question and search results, generate a list of 3 related questions to the given question. Build upon the original question and information from the search results. Make sure the 3 questions are NOT directly answered by the search results. There must be EXACTLY 3 questions. Keep the questions short and concise.

Original Question: {query}
Search Results: {context}
"""
