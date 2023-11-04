import {
  Component,
  Injector,
  OnInit,
  EventEmitter,
  Output
} from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { forEach as _forEach, includes as _includes, map as _map } from 'lodash-es';
import { AppComponentBase } from '@shared/app-component-base';
import {
  UserServiceProxy,
  UserDto,
  RoleDto
} from '@shared/service-proxies/service-proxies';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormBuilder, FormControl, Validators } from '@angular/forms';

@Component({
  templateUrl: './edit-user-dialog.component.html',
  styleUrls: ['./edit-user-dialog.component.scss']
})
export class EditUserDialogComponent extends AppComponentBase
  implements OnInit {
  saving = false;
  formValue: any;
  user = new UserDto();
  roles: RoleDto[] = [];
  checkedRolesMap: { [key: string]: boolean } = {};
  id: number;

  @Output() onSave = new EventEmitter<any>();

  constructor(
    injector: Injector,
    public _userService: UserServiceProxy,
    public bsModalRef: BsModalRef,
    public config: DynamicDialogConfig,
    private _fb: FormBuilder,
    public ref: DynamicDialogRef
  ) {
    super(injector);
  }

  ngOnInit(): void {
    if (this.config?.data?.id) {
      this.formValue = this._fb.group({
        id: new FormControl('',),
        userName: new FormControl('', Validators.required),
        name: new FormControl('', Validators.required),
        surname: new FormControl('', Validators.required),
        fullName: new FormControl(''),
        isActive: new FormControl(true),
        emailAddress: new FormControl('', Validators.required),
        creationTime: new FormControl(''),
        roleNames: new FormControl([]),
      });
    }

    this._userService.get(this.config?.data?.id).subscribe((result) => {
      this.user = result;
      this.setEditData();
      this._userService.getRoles().subscribe((result2) => {
        this.roles = result2.items;
        this.setInitialRolesStatus();
      });
    });

  }

  setEditData() {
    this.formValue.get('id').setValue(this.user.id)
    this.formValue.get('userName').setValue(this.user.userName)
    this.formValue.get('name').setValue(this.user.name)
    this.formValue.get('surname').setValue(this.user.surname)
    this.formValue.get('emailAddress').setValue(this.user.emailAddress)
    this.formValue.get('isActive').setValue(this.user.isActive)
    this.formValue.get('fullName').setValue(this.user.fullName)
    this.formValue.get('roleNames').setValue(this.user.roleNames)
  }

  setInitialRolesStatus(): void {
    _map(this.roles, (item) => {
      this.checkedRolesMap[item.normalizedName] = this.isRoleChecked(
        item.normalizedName
      );
    });
  }

  isRoleChecked(normalizedName: string): boolean {
    return _includes(this.user.roleNames, normalizedName);
  }

  onRoleChange(role: RoleDto, $event) {
    this.checkedRolesMap[role.normalizedName] = $event.target.checked;
  }

  getCheckedRoles(): string[] {
    const roles: string[] = [];
    _forEach(this.checkedRolesMap, function (value, key) {
      if (value) {
        roles.push(key);
      }
    });
    return roles;
  }

  save(): void {
    this.saving = true;
    this.user.roleNames = this.getCheckedRoles();
    this._userService.update(this.user).subscribe(
      () => {
        this.notify.info(this.l('SavedSuccessfully'));
        this.bsModalRef.hide();
        this.onSave.emit();
      },
      () => {
        this.saving = false;
      }
    );
  }

  handleCheckboxChange(data) {
    if (data) {
      this.formValue.get('roleNames').setValue(['ADMIN'])
    } else {
      this.formValue.get('roleNames').setValue([])
    }
  }

  setCurrentDate() {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString();
    return formattedDate
  }

  onsubmit() {
    this.formValue.get('creationTime').setValue(this.setCurrentDate())
    this._userService.update(this.formValue.value).subscribe(
      () => {
        this.notify.info(this.l('SavedSuccessfully'));
        this.bsModalRef.hide();
        this.ref.close();
        this.onSave.emit();
      },
      () => {
        this.saving = false;
      }
    );
  }
}
