from django.shortcuts import render, redirect
from django.core.paginator import Paginator
from django.conf import settings
from django.urls import reverse
from django import http
from FAIRshakeAPI import search, models, stats

def index(request):
  ''' FAIRshakeHub Home Page
  '''
  q = request.GET.get('q', '')
  page = request.GET.get('page', 1)
  page_size = settings.REST_FRAMEWORK['SEARCH_PAGE_SIZE']
  items = [
    result
    for vector in [
      search.ProjectSearchVector(),
      search.DigitalObjectSearchVector(),
      search.RubricSearchVector(),
      search.MetricSearchVector(),
    ]
    for result in (vector.query(q) if q else [])
  ]
  paginator = Paginator(
    items,
    page_size,
  )

  return render(request, 'fairshake/index.html', dict(
      query=q,
      items=paginator.get_page(page),
    )
  )

def contributors_and_partners(request):
  return render(request, 'fairshake/contributors_and_partners.html')

def bookmarklet(request):
  return render(request, 'fairshake/bookmarklet.html')

def chrome_extension(request):
  return render(request, 'fairshake/chrome_extension.html')

def documentation(request):
  return render(request, 'fairshake/documentation/index.html')

def jsonschema_documentation(request):
  return render(request, 'fairshake/documentation/jsonschema.html')

def terms_of_service(request):
  return render(request, 'fairshake/terms_of_service.html')

def privacy_policy(request):
  return render(request, 'fairshake/privacy_policy.html')

def handler(code, message):
  def _handler(request, *args, **kwargs):
    return render(request, 'fairshake/error.html', dict(
      code=code,
      message=message,
    ))
  return _handler

handler400 = handler(400, 'Bad Request')
handler403 = handler(403, 'Permission denied')
handler404 = handler(404, 'Page not Found')
handler500 = handler(500, 'Server error')

def stats_view(request):
  if request.GET.get('model') == 'project':
    try:
      if not models.Project.objects.get(id=request.GET.get('item')).assessments:
        raise Exception()
      page = ''
      for res in {
        'TablePlot': lambda item: stats.TablePlot(item),
        'RubricPieChart': lambda item: stats.RubricPieChart(item.assessments),
        'RubricsByMetricsBreakdown': lambda item: stats.RubricsByMetricsBreakdown(item.id),
        'RubricsInProjectsOverlay': lambda item: stats.RubricsInProjectsOverlay(
          models.Answer.objects.filter(assessment__project__id=item.id),
          item.id,
        ),
        'DigitalObjectBarBreakdown': lambda item: stats.DigitalObjectBarBreakdown(item),
      }.get(request.GET.get('plot'))(models.Project.objects.get(id=request.GET.get('item'))):
        page += res
      return http.HttpResponse(page)
    except:
      return http.HttpResponse('Not enough information was present to construct a plot.')
  return http.HttpResponseNotFound()
