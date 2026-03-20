defmodule Handbooks.Secrets do
  use AshAuthentication.Secret

  def secret_for(
        [:authentication, :tokens, :signing_secret],
        Handbooks.Accounts.User,
        _opts,
        _context
      ) do
    Application.fetch_env(:handbooks, :token_signing_secret)
  end
end
