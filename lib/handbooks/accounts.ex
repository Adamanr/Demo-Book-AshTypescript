defmodule Handbooks.Accounts do
  use Ash.Domain, otp_app: :handbooks, extensions: [AshAdmin.Domain, AshTypescript.Rpc]

  typescript_rpc do
    resource Handbooks.Accounts.User do
      rpc_action :get_by_email, :get_by_email
      rpc_action :list_users, :read
      rpc_action :get_user, :read
    end
  end

  admin do
    show? true
  end

  resources do
    resource Handbooks.Accounts.Token
    resource Handbooks.Accounts.User
  end
end
