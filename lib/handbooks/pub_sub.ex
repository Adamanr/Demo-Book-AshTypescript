defmodule Handbooks.PubSub do
  def broadcast(topic, _event, message) do
    Phoenix.PubSub.broadcast(__MODULE__, topic, message)
  end

  def subscribe(topic) do
    Phoenix.PubSub.subscribe(__MODULE__, topic)
  end
end
