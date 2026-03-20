defmodule HandbooksWeb.PageController do
  use HandbooksWeb, :controller

  def home(conn, _params) do
    render(conn, :home)
  end
end
