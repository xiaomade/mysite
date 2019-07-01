from django.shortcuts import render,get_object_or_404
from django.core.paginator import  Paginator
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from .models import BlogType,Blog
from read_statistics.utils import read_statistics_once_read
from user.forms import LoginForm



def get_blog_list_common_data(request,blogs_all_list):
    paginator = Paginator(blogs_all_list, settings.EACH_PAGE_BLOGS_NUMBER)  # 每两页进行分页
    page_num = request.GET.get('page', 1)
    page_of_blogs = paginator.get_page(page_num)
    # 获取当前页前后两页
    page_range = [x for x in range(int(page_num) - 2, int(page_num) + 3) if 0 < x <= paginator.num_pages]
    # 加省略号
    if page_range[0] >= 3:
        page_range.insert(0, '...')
    if paginator.num_pages - page_range[-1] >= 2:
        page_range.append('...')
    if page_range[0] != 1:
        page_range.insert(0, 1)
    if page_range[-1] != paginator.num_pages:
        page_range.append(paginator.num_pages)
    #获取日期归档对应的博客数量
    blog_dates=Blog.objects.dates('created_time','month',order="DESC")
    blog_dates_dict={}
    for blog_date in blog_dates:
        blog_count=Blog.objects.filter(created_time__year=blog_date.year,
                                           created_time__month=blog_date.month).count()
        blog_dates_dict[blog_date]=blog_count

    context = {}
    context['blogs'] = page_of_blogs.object_list
    context['page_of_blogs'] = page_of_blogs
    context['blog_types'] = BlogType.objects.all()
    context['page_range'] = page_range
    context['blog_dates'] = blog_dates_dict
    return context

def blog_list(request):
    blogs_all_list=Blog.objects.all()
    context=get_blog_list_common_data(request,blogs_all_list)
    return render(request,'blog/blog_list.html',context)

def blog_detail(request,blog_pk):
    blog=get_object_or_404(Blog,pk=blog_pk)
    read_cookie_key=read_statistics_once_read(request,blog)
    blog_content_type = ContentType.objects.get_for_model(blog)
    context = {}
    context['previous_blog']=Blog.objects.filter(created_time__lt=blog.created_time).first()
    context['next_blog']=Blog.objects.filter(created_time__gt=blog.created_time).last()
    context['blog']=blog
    context['login_form']=LoginForm()
    response=render(request,"blog/blog_detail.html",context)
    response.set_cookie(read_cookie_key,'true')
    return response

def blogs_with_type(request,blog_type_pk):
    blog_type=get_object_or_404(BlogType,pk=blog_type_pk)
    blogs_all_list = Blog.objects.filter(blog_type=blog_type)
    context=get_blog_list_common_data(request,blogs_all_list)
    context['blog_type'] = blog_type
    return render(request,'blog/blogs_with_type.html', context)

def blog_with_date(request, year, month):
    blogs_all_list = Blog.objects.filter(created_time__year=year,created_time__month=month)
    context = get_blog_list_common_data(request, blogs_all_list)
    context['blogs_with_date'] = '%s年%s月' %(year,month)
    return render(request,'blog/blogs_with_date.html', context)