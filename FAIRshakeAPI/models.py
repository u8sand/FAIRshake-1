from django.db import models
from django.contrib.auth.models import AbstractUser

class IdentifiableModelMixin(models.Model):
  id = models.AutoField(primary_key=True)

  title = models.CharField(max_length=255, blank=False)
  url = models.CharField(max_length=255, blank=True, default='')
  description = models.TextField(blank=True, default='')
  image = models.CharField(max_length=255, blank=True, default='')
  tags = models.CharField(max_length=255, blank=True, default='')

  type = models.CharField(max_length=16, blank=True, default='', choices=(
    ('', 'Other'),
    ('any', 'Any Digital Object'),
    ('data', 'Database'),
    ('repo', 'Repository'),
    ('test', 'Test Object'),
    ('tool', 'Tool'),
  ))

  authors = models.ManyToManyField('Author', blank=True)

  def tags_as_list(self):
    return self.tags.split()

  class Meta:
    abstract = True

class Project(IdentifiableModelMixin):
  digital_objects = models.ManyToManyField('DigitalObject', blank=True, related_name='projects')

  def children(self):
    return {
      'digital_object': self.digital_objects.all(),
    }

class DigitalObject(IdentifiableModelMixin):
  # A digital object's title is optional while its url is mandator, unlike the rest of the identifiables
  title = models.CharField(max_length=255, blank=True, default='')
  url = models.CharField(max_length=255, blank=False)

  rubrics = models.ManyToManyField('Rubric', blank=True, related_name='digital_objects')

  def score(self, projects=None, rubrics=None):
    '''
    Generate aggregate scores on a per-rubric and per-metric basis.
    '''
    scores = {}

    for assessment in Assessment.objects.filter(
      target=self.id,
      rubric__in=rubrics,
      project__in=projects,
    ):
      if scores.get(assessment.rubric.id) is None:
        scores[assessment.rubric.id] = {}
      for answer in Answer.objects.filter(
        assessment=assessment.id,
      ):
        if scores[assessment.rubric.id].get(answer.metric.id) is None:
          scores[assessment.rubric.id][answer.metric.id] = []
        scores[assessment.rubric.id][answer.metric.id].append(answer.value())

    return {
      rubric: {
        metric: sum(value)/len(value)
        for metric, value in score.items()
      }
      for rubric, score in scores.items()
    }

  def children(self):
    return {
      'project': self.projects.all(),
      'rubric': self.rubrics.all(),
    }

class Assessment(models.Model):
  id = models.AutoField(primary_key=True)
  project = models.ForeignKey('Project', on_delete=models.DO_NOTHING, related_name='assessments')
  target = models.ForeignKey('DigitalObject', on_delete=models.DO_NOTHING, related_name='assessments')
  rubric = models.ForeignKey('Rubric', on_delete=models.DO_NOTHING, related_name='assessments')
  methodology = models.TextField(max_length=16, blank=False, choices=(
    ('self', 'Digital Object Creator Assessment'),
    ('user', 'Independent User Assessment'),
    ('auto', 'Automatic Assessment'),
    ('test', 'Test Assessment'),
  ))
  requestor = models.ForeignKey('Author', on_delete=models.DO_NOTHING, related_name='+', blank=True, default='')
  assessor = models.ForeignKey('Author', on_delete=models.DO_NOTHING, related_name='+', blank=False)
  timestamp = models.DateTimeField(auto_now_add=True)

class Answer(models.Model):
  id = models.AutoField(primary_key=True)
  assessment = models.ForeignKey('Assessment', on_delete=models.DO_NOTHING, related_name='answers')
  metric = models.ForeignKey('Metric', on_delete=models.DO_NOTHING, related_name='answers')
  answer = models.TextField(blank=True, default='')
  comment = models.TextField(blank=True, default='')
  url_comment = models.TextField(blank=True, default='')

  def value(self):
    if self.answer != '':
      if self.comment == '':
        return 0
      return 1
    return -1

class Metric(IdentifiableModelMixin):
  type = models.CharField(max_length=16, blank=True, default='yesnobut', choices=(
    ('yesnobut', 'Yes no or but question'),
    ('text', 'Simple textbox input'),
    ('url', 'A url input'),
  ))

  license = models.CharField(max_length=255, blank=True, default='')

  rationale = models.TextField(blank=True, default='')
  principle = models.CharField(max_length=16, blank=True, default='', choices=(
    ('F', 'Findability',),
    ('A', 'Accessibility',),
    ('I', 'Interoperability',),
    ('R', 'Reusability',),
  ))
  fairmetrics = models.CharField(max_length=255, blank=True, default='')
  fairsharing = models.CharField(max_length=255, blank=True, default='')

  def children(self):
    return {
      'rubric': self.rubrics.all(),
    }

class Rubric(IdentifiableModelMixin):
  license = models.CharField(max_length=255, blank=True, default='')

  metrics = models.ManyToManyField('Metric', blank=True, related_name='rubrics')

  def children(self):
    return {
      'digital_object': self.digital_objects.all(),
      'rubric': self.metrics.all(),
    }

class Author(AbstractUser):
  pass
