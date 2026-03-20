defmodule Handbooks.Books.Book do
  use Ash.Resource,
    otp_app: :handbooks,
    domain: Handbooks.Books,
    data_layer: AshPostgres.DataLayer,
    authorizers: [Ash.Policy.Authorizer],
    extensions: [AshTypescript.Resource],
    notifiers: [Ash.Notifier.PubSub]

  typescript do
    type_name "Book"
  end

  pub_sub do
    module Handbooks.PubSub
    prefix "books"
    publish :create, ["lobby"]
    publish :update, ["lobby"]
    publish :destroy, ["lobby"]
  end

  postgres do
    table "books"
    repo Handbooks.Repo
  end

  actions do
    defaults [:read, :destroy]

    read :get_book do
      description "Get a book by ID"
      get_by :id
    end

    create :create do
      accept [:title, :author, :description, :isbn, :pages, :genre, :published_at]
    end

    update :update do
      accept [:title, :author, :description, :isbn, :pages, :genre, :published_at]
    end
  end

  policies do
    policy always() do
      authorize_if always()
    end
  end

  attributes do
    uuid_primary_key :id

    attribute :title, :string do
      allow_nil? false
      public? true
    end

    attribute :author, :string do
      allow_nil? false
      public? true
    end

    attribute :description, :string do
      public? true
    end

    attribute :isbn, :string do
      public? true
    end

    attribute :pages, :integer do
      public? true
    end

    attribute :genre, :string do
      public? true
    end

    attribute :published_at, :date do
      public? true
    end

    timestamps()
  end
end
