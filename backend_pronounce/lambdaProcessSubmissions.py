import queue

q = queue.Queue()

while not q.empty():
    print("Dequeued:", q.get())

