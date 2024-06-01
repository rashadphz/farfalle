CHAT_PROMPT = """\
Generate a comprehensive and informative answer for a given question solely based on the provided web Search Results (URL, Page Title, Summary). You must only use information from the provided search results. Use an unbiased and journalistic tone.

You must cite the answer using [number] notation. You must cite sentences with their relevant citation number. Cite every part of the answer.
Place citations at the end of the sentence. You can do multiple citations in a row with the format [number1][number2].

Only cite the most relevant results that answer the question accurately. If different results refer to different entities with the same name, write separate answers for each entity.

ONLY cite inline.
DO NOT include a reference section, DO NOT include URLs.
DO NOT repeat the question.


You can use markdown formatting. You should include bullets to list the information in your answer.

<context>
{my_context}
</context>
---------------------

Make sure to match the language of the user's question.

Question: {my_query}
Answer (in the language of the user's question): \
"""

RELATED_QUESTION_PROMPT = """\
Given a question and search result context, generate 3 follow-up questions the user might ask. Use the original question and context.

There must be EXACTLY 3 questions. Keep the questions concise, and simple. This should return an object with the following fields:

questions: A list of 3 concise, simple questions

Make sure to match the language of the user's question.

Original Question: {query}
<context>
{context}
</context>

Your EXACTLY 3 (three) follow-up questions:
"""

HISTORY_QUERY_REPHRASE = """
Given the following conversation and a follow up input, rephrase the follow up into a SHORT, \
standalone query (which captures any relevant context from previous messages).
IMPORTANT: EDIT THE QUERY TO BE CONCISE. Respond with a short, compressed phrase. \
If there is a clear change in topic, disregard the previous messages.
Strip out any information that is not relevant for the retrieval task.

Chat History:
{chat_history}

Make sure to match the language of the user's question.

Follow Up Input: {question}
Standalone question (Respond with only the short combined query):
""".strip()
