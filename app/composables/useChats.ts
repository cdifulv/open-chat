export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  parts: { type: string; text: string }[]
}

export interface Chat {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

interface ChatGroup {
  label: string
  chats: Chat[]
}

const MOCK_RESPONSES = [
  "That's a great question! Let me break this down for you.\n\nHere's what I'd recommend:\n\n1. **Start with the fundamentals** — build a solid understanding of the core concepts before tackling the advanced stuff.\n\n2. **Iterate quickly** — don't aim for perfection on the first pass. Get something working, then refine.\n\n3. **Leverage existing tools** — there's no need to reinvent the wheel when great libraries already exist.\n\nWant me to dive deeper into any of these points?",
  "I'd be happy to help with that! Here's my approach:\n\nFirst, let's consider the **key constraints** you're working with. Understanding boundaries helps us find the most practical solution.\n\nThen we can explore a few different strategies:\n\n- **Option A**: The straightforward approach — simple, reliable, easy to maintain\n- **Option B**: A more sophisticated solution — better performance but higher complexity\n- **Option C**: The hybrid approach — balances simplicity with capability\n\nWhich direction interests you most?",
  "Absolutely, let me walk you through this step by step.\n\n```python\n# Here's a clean implementation\ndef solve(data):\n    result = process(data)\n    return optimize(result)\n```\n\nThe key insight here is that we're **separating concerns** — the processing logic stays independent from the optimization layer. This makes testing much easier and the code more maintainable.\n\nShall I explain any part in more detail?",
  "Great thinking! That's actually one of the more interesting challenges in this space.\n\nThe short answer is: **it depends on your priorities**. Here's the tradeoff matrix:\n\n| Approach | Speed | Reliability | Complexity |\n|----------|-------|------------|------------|\n| Streaming | Fast | Medium | High |\n| Batch | Slow | High | Low |\n| Hybrid | Medium | High | Medium |\n\nFor most use cases, I'd lean toward the **hybrid approach**. It gives you the responsiveness of streaming with the reliability guarantees of batch processing.\n\nWhat's your current setup looking like?",
  "That's a fascinating problem! Let me share a perspective you might not have considered.\n\nThe conventional wisdom says to optimize early, but in practice, **premature optimization is the root of all evil** (as Knuth famously noted). Instead:\n\n1. Get it working correctly first\n2. Measure actual performance\n3. Optimize the real bottlenecks\n\nI've seen teams spend weeks optimizing code paths that account for less than 1% of total execution time. The data should always drive your decisions.\n\nWould you like to discuss profiling strategies?"
]

function createMockChats(): Chat[] {
  const now = Date.now()
  const hour = 3_600_000
  const day = 86_400_000

  return [
    {
      id: 'chat-1',
      title: 'Help me write a Python web scraper',
      messages: [
        {
          id: 'msg-1a',
          role: 'user',
          parts: [{ type: 'text', text: 'Can you help me write a Python web scraper that extracts product prices from an e-commerce site?' }]
        },
        {
          id: 'msg-1b',
          role: 'assistant',
          parts: [{ type: 'text', text: "I'd be happy to help you build a web scraper! Here's a clean approach using `requests` and `BeautifulSoup`:\n\n```python\nimport requests\nfrom bs4 import BeautifulSoup\n\ndef scrape_prices(url):\n    response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})\n    soup = BeautifulSoup(response.text, 'html.parser')\n    \n    prices = []\n    for item in soup.select('.product-card'):\n        name = item.select_one('.product-name').text.strip()\n        price = item.select_one('.price').text.strip()\n        prices.append({'name': name, 'price': price})\n    \n    return prices\n```\n\nA few important considerations:\n\n1. **Respect robots.txt** — always check the site's scraping policy\n2. **Add delays** — use `time.sleep()` between requests to avoid overwhelming the server\n3. **Handle errors gracefully** — network requests can fail for many reasons\n\nWant me to add pagination support or error handling?" }]
        },
        {
          id: 'msg-1c',
          role: 'user',
          parts: [{ type: 'text', text: 'Yes, please add pagination and error handling!' }]
        },
        {
          id: 'msg-1d',
          role: 'assistant',
          parts: [{ type: 'text', text: "Here's the enhanced version with pagination and robust error handling:\n\n```python\nimport requests\nfrom bs4 import BeautifulSoup\nimport time\nimport logging\n\nlogging.basicConfig(level=logging.INFO)\nlogger = logging.getLogger(__name__)\n\ndef scrape_prices(base_url, max_pages=10):\n    all_prices = []\n    \n    for page in range(1, max_pages + 1):\n        try:\n            url = f'{base_url}?page={page}'\n            logger.info(f'Scraping page {page}...')\n            \n            response = requests.get(\n                url,\n                headers={'User-Agent': 'Mozilla/5.0'},\n                timeout=10\n            )\n            response.raise_for_status()\n            \n            soup = BeautifulSoup(response.text, 'html.parser')\n            items = soup.select('.product-card')\n            \n            if not items:\n                logger.info('No more products found')\n                break\n            \n            for item in items:\n                name = item.select_one('.product-name')\n                price = item.select_one('.price')\n                if name and price:\n                    all_prices.append({\n                        'name': name.text.strip(),\n                        'price': price.text.strip()\n                    })\n            \n            time.sleep(1.5)  # Be polite\n            \n        except requests.RequestException as e:\n            logger.error(f'Error on page {page}: {e}')\n            continue\n    \n    return all_prices\n```\n\nThis version handles network timeouts, HTTP errors, missing elements, and includes polite delays between requests." }]
        }
      ],
      createdAt: new Date(now - 2 * hour).toISOString(),
      updatedAt: new Date(now - 2 * hour).toISOString()
    },
    {
      id: 'chat-2',
      title: 'Explain quantum computing basics',
      messages: [
        {
          id: 'msg-2a',
          role: 'user',
          parts: [{ type: 'text', text: "I'm a software engineer trying to understand quantum computing. Can you explain the basics in terms I'd relate to?" }]
        },
        {
          id: 'msg-2b',
          role: 'assistant',
          parts: [{ type: 'text', text: "Great question! Let me bridge quantum computing to concepts you already know.\n\n**Classical bits vs Qubits**\n\nYou know bits — they're 0 or 1. Think of a light switch. A qubit is more like a **dimmer switch** — it can be 0, 1, or any combination of both simultaneously. This is called **superposition**.\n\n**Superposition = Parallel Processing on Steroids**\n\nImagine you're searching a maze. A classical computer tries one path at a time. A quantum computer explores *all paths simultaneously*. With 3 classical bits you can represent one of 8 states. With 3 qubits, you represent all 8 states at once.\n\n**Entanglement = Spooky Linked Variables**\n\nThink of two entangled qubits like two magic dice — no matter how far apart, when you roll one and get a 6, the other *instantly* shows 1. They're correlated in ways that let quantum algorithms coordinate computations impossibly fast.\n\n**Where It Matters**\n\n- **Cryptography** — Shor's algorithm could break RSA\n- **Optimization** — finding the best solution among millions\n- **Simulation** — modeling molecules for drug discovery\n\nIt won't replace your laptop for everyday coding, but for specific problem classes, it's a game-changer." }]
        }
      ],
      createdAt: new Date(now - 5 * hour).toISOString(),
      updatedAt: new Date(now - 5 * hour).toISOString()
    },
    {
      id: 'chat-3',
      title: 'Debug my React useEffect loop',
      messages: [
        {
          id: 'msg-3a',
          role: 'user',
          parts: [{ type: 'text', text: "My React component keeps re-rendering infinitely. I think it's a useEffect issue but I can't figure it out." }]
        },
        {
          id: 'msg-3b',
          role: 'assistant',
          parts: [{ type: 'text', text: "Infinite re-render loops with `useEffect` are one of the most common React pitfalls. Here are the usual suspects:\n\n**1. Missing or wrong dependency array**\n```jsx\n// Bad — runs every render\nuseEffect(() => {\n  setData(transform(props.items))\n})\n\n// Good — runs when items change\nuseEffect(() => {\n  setData(transform(props.items))\n}, [props.items])\n```\n\n**2. Object/array in dependencies**\n```jsx\n// Bad — new object reference every render\nuseEffect(() => {\n  fetchData(filters)\n}, [filters]) // if filters = { page: 1 } created inline\n\n// Good — memoize the object\nconst filters = useMemo(() => ({ page }), [page])\n```\n\n**3. Setting state that triggers the effect**\n```jsx\n// Bad — infinite loop\nuseEffect(() => {\n  setCount(count + 1) // triggers re-render, triggers effect...\n}, [count])\n```\n\nCould you share your component code? I can pinpoint the exact issue." }]
        }
      ],
      createdAt: new Date(now - 1 * day - 3 * hour).toISOString(),
      updatedAt: new Date(now - 1 * day - 3 * hour).toISOString()
    },
    {
      id: 'chat-4',
      title: 'Design a REST API for a todo app',
      messages: [
        {
          id: 'msg-4a',
          role: 'user',
          parts: [{ type: 'text', text: 'What would a well-designed REST API look like for a todo application?' }]
        },
        {
          id: 'msg-4b',
          role: 'assistant',
          parts: [{ type: 'text', text: "Here's a clean REST API design for a todo app following best practices:\n\n**Endpoints**\n\n| Method | Path | Description |\n|--------|------|-------------|\n| `GET` | `/api/todos` | List all todos |\n| `POST` | `/api/todos` | Create a todo |\n| `GET` | `/api/todos/:id` | Get a specific todo |\n| `PATCH` | `/api/todos/:id` | Update a todo |\n| `DELETE` | `/api/todos/:id` | Delete a todo |\n\n**Query Parameters for GET /api/todos**\n- `?status=completed` — filter by status\n- `?sort=createdAt&order=desc` — sorting\n- `?page=1&limit=20` — pagination\n\n**Response Format**\n```json\n{\n  \"data\": [{\n    \"id\": \"uuid\",\n    \"title\": \"Buy groceries\",\n    \"completed\": false,\n    \"createdAt\": \"2024-01-15T10:30:00Z\"\n  }],\n  \"meta\": {\n    \"total\": 42,\n    \"page\": 1,\n    \"limit\": 20\n  }\n}\n```\n\nKey principles: use **plural nouns** for resources, **HTTP methods** for actions, proper **status codes**, and consistent **response envelopes**." }]
        }
      ],
      createdAt: new Date(now - 1 * day - 8 * hour).toISOString(),
      updatedAt: new Date(now - 1 * day - 8 * hour).toISOString()
    },
    {
      id: 'chat-5',
      title: 'Compare TypeScript vs JavaScript for large projects',
      messages: [
        {
          id: 'msg-5a',
          role: 'user',
          parts: [{ type: 'text', text: 'Should I use TypeScript for my next large project? What are the real tradeoffs?' }]
        },
        {
          id: 'msg-5b',
          role: 'assistant',
          parts: [{ type: 'text', text: "For large projects, TypeScript is almost always worth it. Here's an honest assessment:\n\n**Why TypeScript wins at scale:**\n- Catches entire categories of bugs at compile time\n- Self-documenting code through types\n- Incredible IDE support (autocomplete, refactoring)\n- Safer refactoring across large codebases\n- Better team collaboration — types are contracts\n\n**The real costs:**\n- Initial setup and learning curve\n- Slower compilation (mitigated by incremental builds)\n- Some libraries have poor type definitions\n- Can lead to over-engineering with complex generics\n\n**My recommendation:** Use TypeScript with a pragmatic approach. Start with `strict: true` but don't be afraid of `any` as an escape hatch during prototyping. The investment pays off exponentially as the codebase grows past ~10k lines." }]
        }
      ],
      createdAt: new Date(now - 3 * day).toISOString(),
      updatedAt: new Date(now - 3 * day).toISOString()
    },
    {
      id: 'chat-6',
      title: 'Best practices for Docker in production',
      messages: [
        {
          id: 'msg-6a',
          role: 'user',
          parts: [{ type: 'text', text: 'What are the essential Docker best practices for production deployments?' }]
        },
        {
          id: 'msg-6b',
          role: 'assistant',
          parts: [{ type: 'text', text: "Here are the production Docker practices that actually matter:\n\n**1. Use multi-stage builds**\n```dockerfile\nFROM node:20-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nFROM node:20-alpine\nWORKDIR /app\nCOPY --from=builder /app/dist ./dist\nCOPY --from=builder /app/node_modules ./node_modules\nCMD [\"node\", \"dist/main.js\"]\n```\n\n**2. Never run as root** — add `USER node`\n\n**3. Use `.dockerignore`** — keep images lean\n\n**4. Pin versions** — `node:20.11-alpine`, not `node:latest`\n\n**5. Health checks** — `HEALTHCHECK CMD curl -f http://localhost:3000/health`\n\n**6. One process per container** — don't run nginx + node in one container\n\n**7. Use secrets management** — never bake credentials into images" }]
        }
      ],
      createdAt: new Date(now - 5 * day).toISOString(),
      updatedAt: new Date(now - 5 * day).toISOString()
    },
    {
      id: 'chat-7',
      title: 'SQL query optimization tips',
      messages: [
        {
          id: 'msg-7a',
          role: 'user',
          parts: [{ type: 'text', text: 'My database queries are getting slow as the data grows. Any optimization tips?' }]
        },
        {
          id: 'msg-7b',
          role: 'assistant',
          parts: [{ type: 'text', text: "Slow queries are usually caused by a handful of common issues. Let's tackle them:\n\n**1. Index your WHERE clauses**\n```sql\n-- If you query by email often:\nCREATE INDEX idx_users_email ON users(email);\n```\n\n**2. Avoid SELECT ***\n```sql\n-- Bad\nSELECT * FROM orders WHERE user_id = 123;\n\n-- Good\nSELECT id, total, created_at FROM orders WHERE user_id = 123;\n```\n\n**3. Use EXPLAIN ANALYZE** — always check your query plan before optimizing blindly.\n\n**4. Pagination with cursors, not OFFSET**\n```sql\n-- Slow at high offsets\nSELECT * FROM products LIMIT 20 OFFSET 10000;\n\n-- Fast always\nSELECT * FROM products WHERE id > 10000 LIMIT 20;\n```\n\n**5. Denormalize hot paths** — sometimes a little redundancy saves expensive JOINs.\n\nWhat's your database engine and rough table sizes?" }]
        }
      ],
      createdAt: new Date(now - 12 * day).toISOString(),
      updatedAt: new Date(now - 12 * day).toISOString()
    },
    {
      id: 'chat-8',
      title: 'Learning Rust as a JS developer',
      messages: [
        {
          id: 'msg-8a',
          role: 'user',
          parts: [{ type: 'text', text: "I'm a JavaScript developer interested in learning Rust. Where should I start?" }]
        },
        {
          id: 'msg-8b',
          role: 'assistant',
          parts: [{ type: 'text', text: "Welcome to the Rust journey! As a JS dev, you'll find some concepts familiar and others completely new. Here's your roadmap:\n\n**Week 1-2: Foundations**\n- Read chapters 1-6 of *The Rust Book* (free online)\n- Key concepts: ownership, borrowing, lifetimes — this is the big mental shift\n- Think of ownership like JS's garbage collection, but explicit\n\n**Week 3-4: Getting Practical**\n- Build a CLI tool (file processor, API client)\n- Rust's `clap` crate is like `commander.js`\n- `serde` for JSON is like JS's built-in `JSON.parse`\n\n**Concepts that'll trip you up:**\n- No `null` — Rust uses `Option<T>` instead\n- No exceptions — Rust uses `Result<T, E>`\n- No garbage collector — you manage memory through ownership\n- Strings are complex — `String` vs `&str` takes getting used to\n\n**What'll feel familiar:**\n- Pattern matching (like destructuring on steroids)\n- Iterators and closures\n- Package manager (Cargo ≈ npm)\n- Strong module system\n\nThe learning curve is steep for about 2-3 weeks, then it clicks." }]
        }
      ],
      createdAt: new Date(now - 35 * day).toISOString(),
      updatedAt: new Date(now - 35 * day).toISOString()
    }
  ]
}

export function useChats() {
  const chats = useState<Chat[]>('chats', () => createMockChats())
  const activeChatId = useState<string | null>('active-chat', () => null)

  function createChat(firstMessage?: string): Chat {
    const id = `chat-${Date.now()}`
    const chat: Chat = {
      id,
      title: firstMessage?.slice(0, 60) || 'New conversation',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    chats.value.unshift(chat)
    activeChatId.value = id
    return chat
  }

  function deleteChat(id: string) {
    chats.value = chats.value.filter(c => c.id !== id)
    if (activeChatId.value === id) {
      activeChatId.value = null
    }
  }

  function renameChat(id: string, title: string) {
    const chat = chats.value.find(c => c.id === id)
    if (chat) chat.title = title
  }

  function addMessage(chatId: string, role: 'user' | 'assistant', text: string) {
    const chat = chats.value.find(c => c.id === chatId)
    if (!chat) return

    const msgId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    chat.messages.push({
      id: msgId,
      role,
      parts: [{ type: 'text', text }]
    })
    chat.updatedAt = new Date().toISOString()

    if (chat.messages.length === 1 && role === 'user') {
      chat.title = text.slice(0, 60)
    }
  }

  function getMockResponse(input: string): string {
    const index = input.length % MOCK_RESPONSES.length
    return MOCK_RESPONSES[index]!
  }

  function getChatById(id: string): Chat | undefined {
    return chats.value.find(c => c.id === id)
  }

  const groupedChats = computed<ChatGroup[]>(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 86_400_000)
    const weekAgo = new Date(today.getTime() - 7 * 86_400_000)
    const monthAgo = new Date(today.getTime() - 30 * 86_400_000)

    const groups: ChatGroup[] = [
      { label: 'Today', chats: [] },
      { label: 'Yesterday', chats: [] },
      { label: 'Previous 7 days', chats: [] },
      { label: 'Previous 30 days', chats: [] },
      { label: 'Older', chats: [] }
    ]

    for (const chat of chats.value) {
      const date = new Date(chat.updatedAt)
      if (date >= today) groups[0]!.chats.push(chat)
      else if (date >= yesterday) groups[1]!.chats.push(chat)
      else if (date >= weekAgo) groups[2]!.chats.push(chat)
      else if (date >= monthAgo) groups[3]!.chats.push(chat)
      else groups[4]!.chats.push(chat)
    }

    return groups.filter(g => g.chats.length > 0)
  })

  return {
    chats,
    activeChatId,
    groupedChats,
    createChat,
    deleteChat,
    renameChat,
    addMessage,
    getMockResponse,
    getChatById
  }
}
