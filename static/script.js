const chatBox = document.getElementById("chat")

const input = document.getElementById("userInput")

const sendBtn = document.getElementById("sendBtn")

const suggestionBtns = document.querySelectorAll(".suggestions button")

let messages = [

    {

        role: "system",

        content: `

You are an AI device recommendation assistant specifically for the Indian market.

You recommend smartphones and laptops based on:

budget (Specify prices in INR / ₹)
purpose (gaming, programming, student, camera)
battery life
performance
storage
brand reputation in India

Rules:

1. Recommend 3–5 devices available in India when possible.
2. Stay strictly within the user's budget in Indian Rupees.
3. Provide short, concise reasons for each device.
4. Ask follow-up questions if information is missing.
5. If question is unrelated say:
"I specialize in recommending smartphones and laptops."

Format response clearly using markdown bullet points and bolding for emphasis. Keep it visually clean.

Example format:

* **Device Name** (₹ Price)
  * Key features
  * Reason for recommendation

`

    }

]

function addMessage(text, type) {

    const wrapper = document.createElement("div")
    wrapper.className = `message-wrapper ${type}-wrapper`

    if (type === "bot") {
        const avatar = document.createElement("div")
        avatar.className = "avatar-gradient"

        const icon = document.createElement("i")
        icon.className = "fa-solid fa-robot"

        avatar.appendChild(icon)
        wrapper.appendChild(avatar)
    }

    const div = document.createElement("div")

    div.className = type

    div.innerText = text

    wrapper.appendChild(div)

    chatBox.appendChild(wrapper)

    chatBox.scrollTop = chatBox.scrollHeight

    return { wrapper, div }

}

function askQuestion(text) {

    input.value = text

    sendMessage()

}

input.addEventListener("keypress", function (e) {

    if (e.key === "Enter") {

        sendMessage()

    }

})

async function sendMessage() {

    const userText = input.value.trim()

    if (userText === "") return

    input.disabled = true;
    sendBtn.disabled = true;
    suggestionBtns.forEach(btn => btn.disabled = true);

    addMessage(userText, "user")

    input.value = ""

    messages.push({

        role: "user",

        content: userText

    })

    const { wrapper: botMsgWrapper, div: botMsgDiv } = addMessage("Thinking...", "bot")

    try {

        const response = await fetch(

            "/api/chat",

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    messages: messages

                })

            }

        )

        const data = await response.json()

        if (!response.ok) throw new Error(data.error?.message || "API Error")

        const reply = data.choices[0].message.content

        botMsgDiv.innerHTML = marked.parse(reply);

        messages.push({

            role: "assistant",

            content: reply

        })

    }

    catch (error) {

        botMsgWrapper.remove()

        addMessage(

            "Error connecting to AI service.",

            "bot"

        )

    } finally {

        input.disabled = false;
        sendBtn.disabled = false;
        suggestionBtns.forEach(btn => btn.disabled = false);
        input.focus();

    }

}