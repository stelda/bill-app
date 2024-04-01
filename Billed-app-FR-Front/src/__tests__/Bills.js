/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";
import * as mockStore from "../fixtures/bills.js";
import {formatDate, formatStatus} from "../app/format.js";


describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    // Set up authentification
    Object.defineProperty(window, 'localStorage', {value: localStorageMock})
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))
    // Set up the document body
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.append(root)
    router()
    window.onNavigate(ROUTES_PATH.Bills)
  })

  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList).toContain('active-icon');
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({data: bills})
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })

  // test for new bill button
  describe("When I click on New Bill button", () => {
    test("Then it should navigate and display the new bill form", () => {
      const newBillButton = screen.getByTestId('btn-new-bill')
      userEvent.click(newBillButton)
      // check if the window location is new bill page
      expect(window.location.href).toBe('http://localhost/#employee/bill/new')
      // check if the new bill form is displayed
      const newBillForm = screen.getByTestId('form-new-bill')
      expect(newBillForm).toBeTruthy()
    })
  })

  // test for eye icon
  describe("When I click on the eye icon", () => {
    test("Then a modal opens", () => {
      const eyeIcon = screen.getAllByTestId('icon-eye')[0]
      userEvent.click(eyeIcon)
      // check if the modal is opened
      const modal = screen.getByTestId('modaleFile')
      expect(modal.style.display).toBe('block')
      // check if the modal contains title
      expect(modal.querySelector('.content-title').textContent).toBe('Envoyer une note de frais')
      // check if the modal contains a form
      expect(screen.getByTestId("form-new-bill")).toBeTruthy()
    })
  })

  // integration test GET
  describe("When I navigate to Bills", () => {
    test("then fetches bills from mock API GET", async () => {
      // check if the bills are fetched from the mock API
      const bills = await mockStore.bills.list()
      expect(bills.length).toBeGreaterThan(0)
    })
    test("then the bills should be displayed", async () => {
      // check if the table exists
      const table = screen.getByTestId("tbody")
      expect(table).toBeTruthy()
    })

    // test for date
    test("then bills should have a correct date", async () => {
      // check if the bills are fetched from the mock API
      const bills = await mockStore.bills.list()
      // check if the date is correct
      bills.forEach(bill => {
          const date = bill.date
          expect(date).toMatch(formatDate)
      })
    })
    test("then it should log an error if date format is incorrect", async () => {
      // check if the bills are fetched from the mock API
      const bills = await mockStore.bills.list()
      // check if the date is incorrect
      bills[0].date = 'invalid';
      expect(console.log).toHaveBeenCalledWith('e', 'for', expect.anything());
    })

    // test for status
    test("then bills should have a correct status", async () => {
      // check if the table exists
      const table = screen.getByTestId("tbody")
      expect(table).toBeTruthy()
      // check if the bills are fetched from the mock API
      const bills = await mockStore.bills.list()
      // check if the status is correct
      bills.forEach(bill => {
        const status = bill.status
        // expect(status).toMatch(/pending|accepted|refused/)
        expect(status).toMatch(formatStatus)
      })
    })
    test("then it should log an error if status format is incorrect", async () => {
      // modify a status to an incorrect format
        formatStatus.mockImplementation(() => {throw new Error('Invalid status')})
        const bills = await mockStore.bills.list()
        bills[0].status = 'invalid'
        // check if the error is logged
        expect(console.log).toHaveBeenCalledWith('e', 'for', expect.anything());
    })

    test("then it should log the length of bills", async () => {
      const bills = await mockStore.bills.list()
      // check if the length of bills is logged
      expect(console.log).toHaveBeenCalledWith('length', bills.length);
      // check if the length of bills is 4
      expect(bills.length).toBe(4)
      const consoleSpy = jest.spyOn(console, 'log');
      // await getBills();
      expect(consoleSpy).toHaveBeenCalledWith('length', bills.length);
    })
  })

  // test error
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          {value: localStorageMock}
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "e@e"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test(" then fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 404"))
          }
        }
      })
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 500"))
          }
        }
      })
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})
