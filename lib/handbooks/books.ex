defmodule Handbooks.Books do
  use Ash.Domain, otp_app: :handbooks, extensions: [AshAdmin.Domain, AshTypescript.Rpc]

  admin do
    show? true
  end

  typescript_rpc do
    resource Handbooks.Books.Book do
      rpc_action :list_books, :read
      rpc_action :get_book, :get_book
      rpc_action :create_book, :create
      rpc_action :update_book, :update
      rpc_action :delete_book, :destroy
    end
  end

  resources do
    resource Handbooks.Books.Book
  end
end
