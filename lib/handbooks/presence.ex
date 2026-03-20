defmodule Handbooks.Presence do
  use Phoenix.Presence,
    otp_app: :handbooks,
    pubsub_server: Handbooks.PubSub
end
