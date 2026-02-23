from rest_framework.pagination import PageNumberPagination


class StandardPageNumberPagination(PageNumberPagination):
    """
    Default pagination: 10 items per page.
    Clients may override via ?page_size=N (max 50).
    """

    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 50
