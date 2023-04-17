import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Article, Category, Tag } from '../../../interfaces';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ArticlesService } from '../../services/articles.service';
import { concat, map, Observable, toArray } from 'rxjs';
import { UniqueArray } from '../../utils/unique-array.common';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedTagsService } from '../../services/shared-tags.service';
import { SharedCategoriesService } from '../../services/shared-categories.service';
import { Subs } from '../../utils/subs';
import { AutocompleteOptionsFiler } from '../../utils/autocomplete-options-filer';

interface ArticleForm {
  mainTitle: FormControl<string>;
  secondTitle: FormControl<string>;
  photoUrl: FormControl<string>;
  photoText: FormControl<string>;
  body: FormControl<string>;
  category: FormControl<string | Category>;
  tags: FormArray<FormControl<string | Tag>>;
}

interface ArticleForForm {
  main_title: string;
  second_title: string;
  photo_pass: string;
  photo_text: string;
  body: string;
  category_id: string;
}

// корректнее не Create а всё таки Edit, чисто на слух, даже если фича для создания переиспользуется
@Component({
  selector: 'app-article-create-page',
  templateUrl: './article-create-page.component.html',
  styleUrls: ['./article-create-page.component.scss']
})
export class ArticleCreatePageComponent implements OnInit, OnDestroy {
  private _subs = new Subs();
  articleFromResolver: Article | undefined; // лишнее пространство имён, корректнее будет item или article
  form!: FormGroup;
  submitted = false;

  // вот не надо так, все конфиги редактора стоит вынести в app-editor компонент какой-нибудь,
  // а то получается что пейджи слишком много знают о том, что низкоуровневое для них
  public Editor = ClassicEditor;
  CKEditorConfig = {
    placeholder: 'Create your article'
  };
  categoriesList: Category[] = [];
  tagsList: Tag[] = [];
  categoryAutocompleteOptions: AutocompleteOptionsFiler = new AutocompleteOptionsFiler(new FormControl('', {
    nonNullable: true,
    validators: [Validators.required]
  }));
  tagsAutocompleteOptions: AutocompleteOptionsFiler[] = [];
  tagsControls: FormArray<FormControl<Tag | string>> = new FormArray<FormControl<Tag | string>>([]);

  constructor(
    public sharedCategoriesService: SharedCategoriesService,
    private _sharedTagsService: SharedTagsService,
    private _articlesService: ArticlesService,
    private _activatedRoute: ActivatedRoute,
    private _router: Router
  ) {
  }

  ngOnInit() {
    this.articleFromResolver = this._activatedRoute.snapshot.data['article'];
    this._subs.add = this.sharedCategoriesService.categories.subscribe((data) => {
      this.categoriesList = data;
    })
    this._subs.add = this._sharedTagsService.tags.subscribe((data) => {
      this.tagsList = data;
    })

    this.form = new FormGroup<ArticleForm>({
      mainTitle: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required]
      }),
      secondTitle: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required]
      }),
      photoUrl: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required]
      }),
      photoText: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required]
      }),
      body: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required]
      }),
      category: this.categoryAutocompleteOptions.control,
      tags: this.tagsControls
    });

    this.addTag();

    if (this.articleFromResolver) {
      const categoryName = this.getNameById(this.categoriesList, this.articleFromResolver.category_id)
      const tagsNames = this.getArrayOfNamesFromIDs(this.tagsList, this.articleFromResolver.tags)

      if (tagsNames.length > 1) {
        for (let i = 1; i < tagsNames.length; i++) {
          this.addTag()
        }
      }

      const articleForForm: ArticleForForm = {
        ...this.articleFromResolver,
        category_id: categoryName
      }
      this.form.patchValue(articleForForm)
      this.form.patchValue({
        tags: tagsNames
      })
    }
  }

  addTag() {
    this.tagsAutocompleteOptions.push(new AutocompleteOptionsFiler(new FormControl('', {
      nonNullable: true
    })))
    this.UpdateTagsControls();
  }

  // имена методов с маленькой буквы
  // у тебя сейчас получается маленькая свалка из методов,
  // которые можно вынести в дочерние компоненты, а то слишком низкоуровневые операции для пейджи,
  // я делал это на занятиях в answers-edit фиче
  RemoveTag(index: number) {
    this.tagsAutocompleteOptions.splice(index, 1);
    this.UpdateTagsControls();
  }

  UpdateTagsControls() {
    const newControls = this.tagsAutocompleteOptions.map(o => o.control);
    this.tagsControls.clear();
    newControls.forEach(control => this.tagsControls.push(control));
  }

  getArrayOfNamesFromIDs(arrayOfObj: Tag[] | Category[], arrayOfIDs: number[]): string[] {
    return arrayOfIDs.map((id: number) => {
      const result = arrayOfObj.find(obj => obj.id === id);
      return result ? result.name : `!wrong ID: ${id}!`; // !wrong ID вот так точно нельзя, ты используешь хак, вместо того чтобы выкидывать ошибку по-нормальному
    })
  }

  getNameById(array: Tag[] | Category[], id: number): string {
    const result = array.find(obj => obj.id === id);
    return result ? result.name : `!wrong ID: ${id}!`; // ещё и дублируешь этот хак
  }

  submit() {
    if (this.form.invalid) {
      return;
    }

    this.submitted = true;
    const createArticle = () => {
      const article: Article = {
        created_at: new Date().toISOString(),
        category_id: category!,
        main_title: this.form.value.mainTitle,
        second_title: this.form.value.secondTitle,
        photo_pass: this.form.value.photoUrl,
        photo_text: this.form.value.photoText,
        body: this.form.value.body,
        tags: tags
      };
      this._subs.add = this._articlesService.createArticle(article).subscribe(() => {
        this.form.reset();
      })
    }

    const editArticle = () => {
      const article: Article = {
        id: this.articleFromResolver!.id,
        updated_at: new Date().toISOString(),
        category_id: category!,
        main_title: this.form.value.mainTitle,
        second_title: this.form.value.secondTitle,
        photo_pass: this.form.value.photoUrl,
        photo_text: this.form.value.photoText,
        body: this.form.value.body,
        tags: tags
      }
      console.log(article)
      this._subs.add = this._articlesService.editArticle(article).subscribe(() => {
        this.form.reset();
      })
    }

    let category: number | null = null;
    let tags = new UniqueArray<number>();
    const observables: Observable<Category | Tag>[] = [];

    if (typeof this.form.value.category === 'string') {
      observables.push(this.sharedCategoriesService.createCategory(this.form.value.category));
    } else {
      category = this.form.value.category.id;
    }

    for (let tag of this.tagsAutocompleteOptions) {
      if (typeof tag.control.value === 'string') {
        if (tag.control.value.trim()) {
          observables.push(this._sharedTagsService.createTag(tag.control.value));
        }
      } else {
        tags.add(tag.control.value.id);
      }
    }

    this._subs.add = concat(...observables).pipe(
      map(result => result.id),
      toArray()
    ).subscribe(result => {
      for (let i = 0; i < observables.length; i++) {
        if (!category && i === 0) {
          category = result[0];
        } else {
          tags.add(result[i]);
        }
      }
      if (this.articleFromResolver) {
        editArticle();
      } else {
        createArticle();
      }
      this.submitted = false;
      this._router.navigate(['/admin', 'articles']).then();
    })
  }

  ngOnDestroy() {
    this._subs.unsubscribe();
  }
}
