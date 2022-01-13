import swal from 'sweetalert';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {

  @Input() posts: Post[] = [];
  private postsSub: Subscription;
  userIsAuthenticated = false;
  data: any;
  id: string;
  i: number = 0
  newContentId: string;
  user = localStorage.getItem('user');

  constructor(private postService: PostsService, private authService: AuthService, private router: Router) {
  }

  ngOnInit(): void {
    this.postService.getPosts();
    this.postsSub = this.postService.getPostUpdateListener()
      .subscribe((posts: Post[]) => {
        this.posts = posts;
      })
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authService.getAuthStatusListener().subscribe(isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated;
      if (this.userIsAuthenticated == false) {
        this.user = ''
      }
    });

  }

  ngOnDestroy(): void {
    this.postsSub.unsubscribe();
  }

  onDelete(postId: string) {
    this.postService.deletePost(postId);
  }

  onDeleteAnswer(postId: string, newContent: string) {
    swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this answer!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
      .then((willDelete) => {
        if (willDelete) {
          this.postService.deletePostAnswer(postId, newContent).subscribe(() => {
          })
          swal("Answer deleted!", {
            icon: "success",
          });

          this.posts.map((eachPost) => {
            if (eachPost.id == postId) {
              const a = eachPost.newContents.filter((newcontent) => {
                return newcontent['_id'] != newContent
              })
              console.log(a)
            }
          })

        } else {
          swal("Answer not deleted!");
        }
      });


  }
  postId: string;
  onEditAnswer(postId: string, newContentId: string) {
    this.newContentId = newContentId
    this.postId = postId;
  }

  previousValue: string;
  keyUp(editContent: string, x) {
    this.previousValue = x.__ngContext__[40];
    // console.log(this.postId, this.newContentId, editContent)
    this.postService.editPostAnswer(this.postId, this.newContentId, editContent)
      .subscribe((result) => {

      })
    this.posts.map((eachPost) => {
      if (eachPost.id == this.postId) {
        eachPost.newContents.map((newcontent) => {
          if (newcontent['_id'] == this.newContentId) {
            newcontent['newContent'] = editContent;
          }
        })
      }
    })
    this.newContentId = null;


    // let currentUrl = this.router.url;
    // this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    // this.router.onSameUrlNavigation = 'reload';
    // this.router.navigate([currentUrl]);

  }


  ngAnswer(postId: string) {
    this.id = postId;
    this.router.navigate(['/question-answer'], {
      state: { id: this.id }
    });
  }





}
