defmodule Handbooks.Repo do
  use Ecto.Repo,
    otp_app: :handbooks,
    adapter: Ecto.Adapters.Postgres
end
