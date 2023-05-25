import { Component, OnInit } from '@angular/core';

import { Select } from './services/select.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  private _items: Select[] = [];

  ngOnInit(): void {
    this.factoryElements();
  }

  factoryElements() {
    this._items = items.map((item) => ({
      id: item.numeroInstituicao,
      label: item.nome,
    }));
  }

  get items() {
    return this._items;
  }
}

const items = [
  {
    _id: {
      $oid: '633c3ceef47e3f73073ae381',
    },
    numeroInstituicao: '3003',
    idInstituicao: 24,
    nome: 'COOPERATIVA DE CREDITO DE LIVRE ADMISSAO SUL DO ESPIRITO SANTO - SICOOB SUL',
    numeroInstituicaoResponsavel: '1001',
    tipoDeInstituicao: 'Singular',
  },
  {
    _id: {
      $oid: '633c3ceef47e3f73073ae397',
    },
    numeroInstituicao: '3007',
    idInstituicao: 28,
    nome: 'COOPERATIVA DE CREDITO DE LIVRE ADMISSAO LESTE CAPIXABA ',
    numeroInstituicaoResponsavel: '1001',
    tipoDeInstituicao: 'Singular',
  },
  {
    _id: {
      $oid: '633c3ceef47e3f73073ae3a1',
    },
    numeroInstituicao: '3008',
    idInstituicao: 29,
    nome: 'COOPERATIVA DE CREDITO DE LIVRE ADMISSAO CENTRO SERRANA DO ESPIRITO SANTO - SICOOB CENTRO SERRANO',
    numeroInstituicaoResponsavel: '1001',
    tipoDeInstituicao: 'Singular',
  },
  {
    _id: {
      $oid: '633c3ceef47e3f73073ae3ab',
    },
    numeroInstituicao: '3009',
    idInstituicao: 30,
    nome: 'COOPERATIVA DE CREDITO DE LIVRE ADMISSAO NORTE DO ESPIRITO SANTO - SICOOB NORTE',
    numeroInstituicaoResponsavel: '1001',
    tipoDeInstituicao: 'Singular',
  },
  {
    _id: {
      $oid: '633c3ceff47e3f73073ae3b7',
    },
    numeroInstituicao: '3010',
    idInstituicao: 31,
    nome: 'COOPERATIVA DE CREDITO DE LIVRE ADMISSAO SUL-SERRANA DO ESPIRITO SANTO - SICOOB SUL-SERRANO',
    numeroInstituicaoResponsavel: '1001',
    tipoDeInstituicao: 'Singular',
  },
  {
    _id: {
      $oid: '633c3ceff47e3f73073ae3c3',
    },
    numeroInstituicao: '3011',
    idInstituicao: 32,
    nome: 'COOPERATIVA DE CRÉDITO RURAL DE ITABUNA LTDA',
    numeroInstituicaoResponsavel: '1002',
    tipoDeInstituicao: 'Singular',
    activeHistory: [
      {
        status: true,
        userId: 'yuri.araujo',
      },
    ],
  },
  {
    _id: {
      $oid: '633c3ceff47e3f73073ae3eb',
    },
    numeroInstituicao: '3012',
    idInstituicao: 33,
    nome: 'COOPERATIVA DE CRÉDITO RURAL DO OESTE LTDA',
    numeroInstituicaoResponsavel: '1002',
    tipoDeInstituicao: 'Singular',
  },
  {
    _id: {
      $oid: '633c3ceff47e3f73073ae3f6',
    },
    numeroInstituicao: '3013',
    idInstituicao: 34,
    nome: 'COOPERATIVA DE CRÉDITO RURAL DE ILHÉUS LTDA',
    numeroInstituicaoResponsavel: '1002',
    tipoDeInstituicao: 'Singular',
  },
];
