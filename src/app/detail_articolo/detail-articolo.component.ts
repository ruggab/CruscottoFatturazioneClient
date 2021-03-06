import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Articoli } from 'app/models/Articoli';
import { ArticoliService } from 'app/shared/Service/Articoli/articoli.service';
import { AuthService } from 'app/shared/Service/AuthService/auth.service';
import { CommonService } from 'app/shared/Service/Common/common.service';
import { UserService } from 'app/shared/Service/User/user.service';
import { Subscription } from 'rxjs';
import * as moment from 'moment';

@Component({
  selector: 'app-detail-articolo',
  templateUrl: './detail-articolo.component.html',
  styleUrls: ['./detail-articolo.component.scss']
})
export class DetailArticoloComponent implements OnInit {
  // Init Param
  public action: string = "";
  public id: number = -1;

  public buttonTitle: string = "Aggiorna Articolo";
  public isEdit: boolean = false;

  public articolo = new Articoli(-1, null, "", moment("31/12/2050", "DD/MM/YYYY").toDate(), "", moment().toDate(), "", null, "");
  public userLogged;

  private mySubscription: Subscription;
  private saveSubscription: Subscription;

  public codiceArticoloCtrl = new FormControl('', [Validators.required, Validators.maxLength(3)]);
  public descrizioneCtrl = new FormControl('', [Validators.required, Validators.maxLength(35)]);
  public validToCtrl = new FormControl('', [Validators.required]);
  public validFromCtrl = new FormControl('', [Validators.required]);
  date = moment("31/12/2050", "DD/MM/YYYY");

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private common: CommonService,
    private userService: UserService,
    private articoliService: ArticoliService

  ) { }

  ngOnInit() {
    this.common.sendUpdate("showSpinner");

    this.userLogged = this.authService.getUser();

    this.action = this.route.snapshot.paramMap.get('action');
    this.id = +this.route.snapshot.paramMap.get('id');

    if (this.action == "create") {
      this.isEdit = true;
      this.buttonTitle = "Crea Articolo";
      this.common.sendUpdate("hideSpinner");
    }
    else if (this.action == "edit") {
      this.isEdit = true;
      this.getDetail();

    }
    else {
      this.isEdit = false;
      this.getDetail();

    }
  }


  getDetail() {
    let authToken: string = this.authService.getAuthToken();
    //this.isEdit = true;
    this.mySubscription = this.articoliService.getArticoloById(authToken, this.id).subscribe(res => {
      this.articolo = res as Articoli;
      this.common.sendUpdate("hideSpinner");
    },
      error => {
        // console.log("getTopSummary");
        // console.log(error);
        this.common.sendUpdate("hideSpinner");
        this.common.sendUpdate("showAlertDanger", error.message);
      });
  };

  salvaArticolo() {
    this.common.sendUpdate("showSpinner");

    if (this.codiceArticoloCtrl.valid == true) {
      if (this.descrizioneCtrl.valid == true) {
        if (this.validFromCtrl.valid == true) {
          if (this.validToCtrl.valid == true) {
            let authToken: string = this.authService.getAuthToken();
            this.saveSubscription = this.articoliService.saveArticolo(authToken, this.articolo, this.userLogged.name).subscribe((res: boolean) => {
              if (!res['errore']) {
                //console.log(res);
                this.common.sendUpdate("showAlertInfo", "Articolo salvato correttamente!");

                this.common.redirectToUrl('/articoli');
                this.common.sendUpdate("hideSpinner");
              }
              else {
                this.codiceArticoloCtrl.setErrors({ codice: true })
                this.common.sendUpdate("hideSpinner");
                this.common.sendUpdate("showAlertDanger", !res['errore'] ? "Impossibile salvare l'articolo al momento." : res['errore']);
              }
            },
              error => {
                // console.log("getTopSummary");
                // console.log(error);

                this.common.sendUpdate("hideSpinner");
                this.common.sendUpdate("showAlertDanger", error.message);
              });
          }

        }
      }
    }

    this.common.sendUpdate("hideSpinner");
  }


  // VALIDATION
  getCodiceArticoloErrorMessage() {
    if (this.codiceArticoloCtrl.hasError('minlength')) {
      return "Il codice deve contenere minimo 1 caratteri";
    }
    else if (this.codiceArticoloCtrl.hasError('maxlength')) {
      return "Il codice deve contenere al massimo 3 caratteri";
    }
    else if (this.codiceArticoloCtrl.hasError('required')) {
      return "Codice non valido";
    }
    else {
      return "";
    }
  }

  getDescrizioneErrorMessage() {
    if (this.descrizioneCtrl.hasError('maxlength')) {
      return "La descrizione deve contenere al massimo 35 caratteri";
    }
    else if (this.descrizioneCtrl.hasError('required')) {
      return "Descrizione non valida";
    } else if (this.codiceArticoloCtrl.hasError('codice')) {
      return "Codice cliente gi?? esistente";
    }
    else {
      return "";
    }
  }


  getValidFromErrorMessage() {
    if (this.validFromCtrl.hasError('required')) {
      return "Data Inizio Validit?? non valida";
    }
    else {
      return "";
    }
  }

  getValidToErrorMessage() {
    if (this.validToCtrl.hasError('required')) {
      return "Data Fine Validit?? non valida";
    }
    else {
      return "";
    }
  }

  ngOnDestroy(): void {
    ///qui viene distrutto il componente
    if (this.mySubscription)
      this.mySubscription.unsubscribe();

    if (this.saveSubscription)
      this.saveSubscription.unsubscribe();

  }
}
