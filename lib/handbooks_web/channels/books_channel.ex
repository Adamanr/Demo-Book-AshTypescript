defmodule HandbooksWeb.BooksChannel do
  use Phoenix.Channel

  intercept ["presence_diff"]

  def join("books:lobby", _payload, socket) do
    send(self(), :after_join)
    {:ok, socket}
  end

  def handle_info(:after_join, socket) do
    viewer_id = :crypto.strong_rand_bytes(6) |> Base.encode16(case: :lower)
    socket = assign(socket, :viewer_id, viewer_id)

    {:ok, _} =
      Handbooks.Presence.track(socket, viewer_id, %{online_at: System.system_time(:second)})

    push(socket, "presence_state", Handbooks.Presence.list(socket))
    {:noreply, socket}
  end

  def handle_info(%Ash.Notifier.Notification{action: %{type: :create}, data: book}, socket) do
    push(socket, "book:created", format_book(book))
    push(socket, "activity", %{type: "created", title: book.title, at: now()})
    {:noreply, socket}
  end

  def handle_info(%Ash.Notifier.Notification{action: %{type: :update}, data: book}, socket) do
    push(socket, "book:updated", format_book(book))
    push(socket, "activity", %{type: "updated", title: book.title, at: now()})
    {:noreply, socket}
  end

  def handle_info(%Ash.Notifier.Notification{action: %{type: :destroy}, data: book}, socket) do
    push(socket, "book:deleted", %{id: book.id})
    push(socket, "activity", %{type: "deleted", title: book.title, at: now()})
    {:noreply, socket}
  end

  def handle_out("presence_diff", diff, socket) do
    push(socket, "presence_diff", diff)
    {:noreply, socket}
  end

  defp format_book(book) do
    %{
      id: book.id,
      title: book.title,
      author: book.author,
      description: book.description,
      isbn: book.isbn,
      pages: book.pages,
      genre: book.genre,
      publishedAt: book.published_at && Date.to_iso8601(book.published_at)
    }
  end

  defp now, do: DateTime.utc_now() |> DateTime.to_iso8601()
end
